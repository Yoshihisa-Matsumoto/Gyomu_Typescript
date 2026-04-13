import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';
import xml2js from 'xml2js';
import { platform } from './platform/index.js';
import { finished } from 'stream/promises';
import { Readable } from 'stream';
import { IOError, NetworkError, ValueError } from './errors.js';
import { Effect, pipe, Stream } from 'effect';
import { networkStream } from './shared/effect.ts/stream.js';
import { fromPromise, fromSync } from './shared/effect.ts/core.js';

export type FetchResult<ResponseType> = {
  value: ResponseType;
  code: number;
  extraAttribute?: any;
};

export const fetchStream = (
  url: string,
  options?: RequestInit,
): Stream.Stream<Uint8Array, NetworkError> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const response = yield* fetchEffect(url, options);

      if (!response.ok) {
        return yield* Effect.fail(
          new NetworkError(`HTTP Error: ${response.status} ${url}`),
        );
      }

      if (!response.body) {
        return yield* Effect.fail(new NetworkError(`No response body: ${url}`));
      }

      return Stream.fromReadableStream({
        evaluate: () => response.body!,
        onError: (e) => new NetworkError(`Stream error: ${String(e)} (${url})`),
      });
    }),
  );
const fetchEffect = (url: string, init?: RequestInit) =>
  fromPromise(NetworkError, `Fetch Error to ${url}`)(() => fetch(url, init));

const jsonEffect = <T>(
  stream: Stream.Stream<Uint8Array, NetworkError>,
): Effect.Effect<T, NetworkError | ValueError> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runCollect,
    Effect.flatMap((chunks) =>
      fromSync(
        ValueError,
        `Invalid JSON`,
      )(() => JSON.parse(chunks.join('')) as T),
    ),
  );

const textEffect = (stream: Stream.Stream<Uint8Array, NetworkError>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runCollect,
    Effect.map((chunks) => chunks.join('')),
  );

const validate =
  <A>(predicate?: (a: A) => boolean) =>
  (effect: Effect.Effect<A, NetworkError | ValueError>) =>
    effect.pipe(
      Effect.filterOrFail(
        (a) => predicate?.(a) ?? true,
        (a) => new ValueError(`Invalid Response Data : ${JSON.stringify(a)}`),
      ),
    );
export function fetchJson<RequestType, ResponseType>(
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
  input: RequestType,
  option?: {
    headers?: Record<string, string>;
    isValidData?: (obj: ResponseType) => boolean;
    extraAttribute?: any;
  },
): Effect.Effect<FetchResult<ResponseType>, NetworkError | ValueError> {
  let headers: Record<string, string> = {};
  if (!option?.headers) {
    headers = { 'Content-Type': 'application/json' };
  } else {
    headers = option.headers;
    headers['Content-Type'] = 'application/json';
  }

  const stream = fetchStream(
    url,
    input
      ? { method, headers, body: JSON.stringify(input) }
      : { method, headers },
  );
  return pipe(
    stream,
    jsonEffect<ResponseType>,
    validate(option?.isValidData),
    Effect.map((jsonData) => ({
      value: jsonData,
      code: 200, // ← 後述
      extraAttribute: option?.extraAttribute,
    })),
  );
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
): Effect.Effect<
  {
    value: ResponseType;
    code: number;
    extraAttribute?: any;
  },
  NetworkError | ValueError
> {
  const headers: Record<string, string> = {
    ...(option?.headers ?? {}),
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = new URLSearchParams(input).toString();

  return Effect.gen(function* () {
    // =====================
    // fetch (statusも保持)
    // =====================
    const response = yield* fetchEffect(url, {
      method: 'POST',
      headers,
      body,
    });

    const statusCode = response.status;

    if (!response.body) {
      return yield* Effect.fail(new NetworkError('No response body'));
    }

    // =====================
    // stream → text
    // =====================
    const text = yield* pipe(
      networkStream(() => response.body!, `Fetching XML from ${url}`),
      textEffect, // ← さっき作ったやつ再利用
    );

    // =====================
    // XML parse
    // =====================
    const parser = new xml2js.Parser();

    const resultData = yield* fromPromise(
      NetworkError,
      `fail to parse response text`,
    )(() => parser.parseStringPromise(text) as Promise<ResponseType>);

    // =====================
    // validate
    // =====================
    if (option?.isValidData && !option.isValidData(resultData)) {
      return yield* Effect.fail(new ValueError(`Invalid Response Data`));
    }

    return {
      value: resultData,
      code: statusCode,
      extraAttribute: option?.extraAttribute,
    };
  });
}
export const webDownloadStream = (
  url: string,
  headers?: Record<string, string>,
): Stream.Stream<Uint8Array, NetworkError> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const response = yield* fetchEffect(url, { headers });

      if (!response.body) {
        return yield* Effect.fail(new NetworkError('No response body'));
      }

      return networkStream(() => response.body!, `Stream error `);
    }),
  );
export const webDownload = (
  url: string,
  destinationFilename: string,
  headers?: Record<string, string>,
): Effect.Effect<boolean, NetworkError | IOError> =>
  Effect.gen(function* () {
    // =====================
    // validation
    // =====================
    if (
      platform.existsSync(destinationFilename) &&
      destinationFilename !== platform.basename(destinationFilename)
    ) {
      return yield* Effect.fail(
        new IOError(`Invalid Filepath :${destinationFilename}`),
      );
    }

    if (
      platform.existsSync(destinationFilename) &&
      platform.lstatSync(destinationFilename).isDirectory()
    ) {
      return yield* Effect.fail(
        new IOError(`This is directory:${destinationFilename}`),
      );
    }

    if (!platform.extname(destinationFilename)) {
      return yield* Effect.fail(
        new IOError(
          `file name should include extension:${destinationFilename}`,
        ),
      );
    }

    // =====================
    // file prepare
    // =====================
    yield* fromSync(
      IOError,
      'fail to prepare files to save',
    )(() => {
      platform.ensureFileSync(destinationFilename);
      platform.removeSync(destinationFilename);
    });

    // =====================
    // download stream
    // =====================
    const stream = webDownloadStream(url, headers);

    // =====================
    // write file
    // =====================
    yield* fromPromise(
      IOError,
      `Web Download Error:${url} into ${destinationFilename}`,
    )(async () => {
      const fileWriterStream = platform.createWriteStream(destinationFilename);

      await finished(Readable.fromWeb(stream as any).pipe(fileWriterStream));
    });

    return true;
  });
