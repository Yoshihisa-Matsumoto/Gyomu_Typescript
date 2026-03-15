import {
  GyomuResultAsync,
  runAsync,
  okAsync,
  errAsync,
  ensure,
  result2Async,
  run,
} from './result.js';
import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';
import xml2js from 'xml2js';
import { platform } from './platform/index.js';
import { finished } from 'stream/promises';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';
import { logger } from './logger.js';
import { IOError, NetworkError, ValueError } from './errors.js';

export type FetchResult<ResponseType> = {
  value: ResponseType;
  code: number;
  extraAttribute?: any;
};

export function fetchJson<RequestType, ResponseType>(
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
  input: RequestType,
  option?: {
    headers?: Record<string, string>;
    isValidData?: (obj: ResponseType) => boolean;
    extraAttribute?: any;
  },
): GyomuResultAsync<FetchResult<ResponseType>> {
  let headers: Record<string, string> = {};
  if (!option?.headers) {
    headers = { 'Content-Type': 'application/json' };
  } else {
    headers = option.headers;
    headers['Content-Type'] = 'application/json';
  }

  // const options: OptionsOfTextResponseBody = {
  //   method: method,
  //   headers:headers,
  //   json: input ? JSON.parse(JSON.stringify(input)) : undefined,
  // };
  //console.log('options', headers);
  return runAsync(
    () =>
      fetch(
        url,
        input
          ? {
              method,
              headers,
              body: JSON.stringify(input),
            }
          : {
              method,
              headers,
            },
      ),
    NetworkError,
    `Fetch Error to ${url}`,
  ).andThen((response) => {
    //console.log(JSON.stringify(response));
    //const jsonData: Awaited<ResponseType> = await response.json<ResponseType>();
    const statusCode = response.status;
    if (!response.body) {
      return okAsync({
        value: response.body as ResponseType,
        code: statusCode,
        extraAttribute: option?.extraAttribute,
      });
    } else {
      logger.info(response.body);
      logger.info(response.status);
      return runAsync(
        () => response.json() as Promise<ResponseType>,
        NetworkError,
        `fail to convert into Json`,
      ).andThen((jsonData) => {
        if (option?.isValidData) {
          if (!option.isValidData(jsonData)) {
            return errAsync(
              new ValueError(
                `Invalid Response Data : ${JSON.stringify(jsonData)}`,
              ),
            );
          }
        }
        return okAsync({
          value: jsonData,
          code: statusCode,
          extraAttribute: option?.extraAttribute,
        });
      });
    }
  });
}

export function simpleWebAccess(url: string, isInternal: boolean = true) {
  if (!isInternal && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY)) {
    setGlobalDispatcher(new EnvHttpProxyAgent());
  }
  return fetch(url);
}

export function postAndReceiveXml<ResponseType>(
  url: string,
  input: Record<string, string>,
  option?: {
    headers?: Record<string, string>;
    isValidData?: (obj: ResponseType) => boolean;
    extraAttribute?: any;
  },
): GyomuResultAsync<{
  value: ResponseType;
  code: number;
  extraAttribute?: any;
}> {
  let headers: Record<string, string> = {};
  if (!option?.headers) {
    headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  } else {
    headers = option.headers;
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  // const options: OptionsOfTextResponseBody = {
  //   method: 'POST',
  //   headers,
  //   form: input,
  // };
  return runAsync(
    () =>
      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      }),
    NetworkError,
    'fetch POST to ${url}',
  )
    .andThen((response) => {
      const statusCode = response.status;
      //console.log(response.body);
      return runAsync(
        () => response.text(),
        NetworkError,
        'fail to get response text',
      ).map((text) => {
        return { statusCode, text };
      });
    })
    .andThen(({ statusCode, text }) => {
      const parser = new xml2js.Parser();
      return runAsync(
        () => parser.parseStringPromise(text) as Promise<ResponseType>,
        NetworkError,
        'fail to parse response text',
      ).map((resultData) => {
        return { statusCode, resultData };
      });
    })
    .andThen(({ statusCode, resultData }) => {
      if (option?.isValidData) {
        if (!option.isValidData(resultData)) {
          return errAsync(
            new ValueError(`Invalid Response Data : ${resultData}`),
          );
        }
      }
      return okAsync({
        value: resultData,
        code: statusCode,
        extraAttribute: option?.extraAttribute,
      });
    });
}
export const webDownloadStream = (
  url: string,
  headers?: Record<string, string>,
): GyomuResultAsync<ReadableStream<any>> => {
  return runAsync(
    () => fetch(url, { headers }),
    NetworkError,
    `Web Download Error:${url}`,
  ).andThen((response) => {
    if (!response.body) return errAsync(new NetworkError(`No response body`));
    return okAsync(response.body as ReadableStream<any>);
  });
};
export const webDownload = (
  url: string,
  destinationFilename: string,
  headers?: Record<string, string>,
): GyomuResultAsync<boolean> => {
  return result2Async(
    ensure(
      !platform.existsSync(destinationFilename) ||
        destinationFilename == platform.basename(destinationFilename),
      IOError,
      `Invalid Filepath :${destinationFilename}`,
    ),
  )
    .andThen(() =>
      ensure(
        !platform.existsSync(destinationFilename) ||
          !platform.lstatSync(destinationFilename).isDirectory(),
        IOError,
        `This is directory:${destinationFilename}`,
      ),
    )
    .andThen(() =>
      ensure(
        !!platform.extname(destinationFilename),
        IOError,
        `file name should include extension:${destinationFilename}`,
      ),
    )
    .andThen(() =>
      result2Async(
        run(
          () => {
            platform.ensureFileSync(destinationFilename);
            platform.removeSync(destinationFilename);
          },
          IOError,
          'fail to prepare files to save',
        ).map(() => true),
      ),
    )
    .andThen(() => webDownloadStream(url, headers))
    .andThen((readStream) =>
      runAsync(
        () => {
          const fileWriterStream =
            platform.createWriteStream(destinationFilename);
          return finished(Readable.fromWeb(readStream).pipe(fileWriterStream));
        },
        IOError,
        `Web Download Error:${url} into ${destinationFilename}`,
      ),
    )
    .map(() => true);
};
