import { runAsync, GyomuResultAsync } from './result';
import { platform, ReadStream } from './platform';
import * as csv from 'csv';
import { Readable, pipeline } from 'stream';

import { parse, Options } from 'csv-parse';
import { CsvSource } from './types/csvSource';
import { GzipArchive, ZipArchive } from './archive';
import { FileInput } from './buffer';
import { IOError } from './errors';
import { createDecoder } from './encoding/decode';

type CsvWriteOption = {
  fields?: Record<string, string>;
  quoted?: boolean;
  outputFilename?: string;
  bom?: boolean;
};
// export const Json2CSV = async (records: object[], option?: CsvWriteOption) => {
//   //if (!fields) fields = [];

//   //const parser = new Parser({ header: true, withBOM: true });
//   let csvOption: Options<unknown> = {
//     columns: true,
//     withBOM: true,
//   };

//   if (!!option?.fields) {
//     csvOption.columns = undefined;
//     const fields = option.fields as Record<string, string>;
//     const fieldInfo: FieldInfo<unknown>[] = [];
//     for (var key of Object.keys(fields)) {
//       fieldInfo.push({ label: fields[key], value: key });
//     }
//     csvOption.fields = fieldInfo;
//   }
//   let parser = new AsyncParser(csvOption);
//   //const data = parser.parse(records);
//   // const data = parse(records, {
//   //   header: true,
//   //   withBOM: true,
//   // });
//   try{
//     parser.input.push(Buffer.from(JSON.stringify(records)));
//     if (!!option?.outputFilename) {
//       parser = parser.toOutput(fs.createWriteStream(option?.outputFilename));
//       return success(await parser.promise(false));
//     }

//     return success(await parser.promise(true));
//   }catch(err :any){
//     return Failure.fromMessage('CSV Convert Failed',IOError)
//   }

// };
export const Json2Csv = (records: object[], option?: CsvWriteOption) => {
  const csvOption: csv.stringifier.Options = {
    header: true,
    record_delimiter: 'windows',
    eof: false,
  };
  csvOption.quoted = option?.quoted;
  csvOption.bom = option?.bom;
  if (!csvOption.bom) {
    csvOption.bom = false;
  }
  if (option?.fields) {
    csvOption.columns = undefined;
    const fields = option.fields as Record<string, string>;
    const fieldInfo: csv.stringifier.ColumnOption[] = [];
    for (const key of Object.keys(fields)) {
      fieldInfo.push({ header: fields[key], key });
    }
    csvOption.columns = fieldInfo;
  }

  //console.log(csvOption);

  if (!option?.outputFilename) {
    // return string
    return runAsync(
      () =>
        new Promise<string>((resolve, reject) => {
          csv.stringify(records, csvOption, (err, output) => {
            if (err) {
              return reject(new IOError('Error to generate CSV data: ', err));
            }
            return resolve(output);
          });
        }),
      IOError,
      'fail to generate csv data',
    );
  } else {
    return runAsync(
      () =>
        new Promise<boolean>((resolve, reject) => {
          const writeStream = platform.createWriteStream(
            option.outputFilename as string,
          );
          csv
            .stringify(records, csvOption)
            .on('data', (chunk) => {
              writeStream.write(chunk);
            })
            .on('error', (err) => {
              writeStream.close();
              reject(new IOError(`Fail to dump csv file`, err));
            })
            .on('finish', () => {
              writeStream.close((err2) => {
                if (err2) {
                  reject(new IOError(`Fail to dump csv file`, err2));
                }
                resolve(true);
              });
            });
        }),
      IOError,
      `Fail to generate csv file: ${option.outputFilename}`,
    );
    // generate file
  }
};

type CsvReadOption = {
  fields?: string[];
  bom?: boolean;
  outputFilename?: string;
  encoding?: string;
  filterFn?: (data: Record<string, string>) => boolean;
};

// export const CsvStream2Json = async (
//   stream: fs.ReadStream | NodeJS.ReadWriteStream,
//   option?: CsvReadOption,
// ): PromiseResult<Record<string, string>[]> => {
//   const csvOption: csv.parser.Options = {
//     columns: true,
//     bom: false,
//   };

//   if (option?.bom) {
//     csvOption.bom = true;
//   }
//   if (option?.fields) {
//     csvOption.columns = option.fields;
//   }

//   const result = new Promise<Result<Record<string, string>[]>>(
//     // eslint-disable-next-line no-async-promise-executor
//     async (resolve) => {
//       try {
//         if (option?.encoding) {
//           stream = stream.pipe(iconv.decodeStream(option.encoding));
//         }
//         stream.pipe(
//           csv.parse(csvOption, (err, data) => {
//             if (err) {
//               return resolve(
//                 Failure.fromMessage('Error to read CSV data: ' + err.message),
//               );
//             }
//             return resolve(success(data as Record<string, string>[]));
//           }),
//         );
//       } catch (err2: any) {
//         return resolve(
//           Failure.fromMessage('Error to read CSV data: ' + err2.message),
//         );
//       }
//     },
//   );
//   return result;
// };
const CsvStream2JsonParser = (
  stream: ReadStream | NodeJS.ReadWriteStream,
  option?: CsvReadOption,
) => {
  const csvOption: csv.parser.Options = {
    columns: true,
    bom: false,
  };

  if (option?.bom) {
    csvOption.bom = true;
  }
  if (option?.fields) {
    csvOption.columns = option.fields;
  }
  if (option?.encoding) {
    stream = stream.pipe(createDecoder(option.encoding));
  }
  const parser = stream.pipe(csv.parse(csvOption));
  return parser;
};

export const CsvStream2Json = (
  stream: ReadStream | NodeJS.ReadWriteStream,
  option?: CsvReadOption,
): GyomuResultAsync<Record<string, string>[]> => {
  return runAsync(
    async () => {
      const parser = CsvStream2JsonParser(stream, option);
      const iterator = parser.iterator() as AsyncIterator<
        Record<string, string>,
        any,
        any
      > &
        Readable;

      const output: Record<string, string>[] = [];
      for await (const a of iterator) {
        const record: Record<string, string> = a as Record<string, string>;
        if (!option || !option.filterFn || option.filterFn(record)) {
          output.push(record);
        }
      }
      return output;
    },
    IOError,
    'fail to create JSON from csv data',
  );
};
export const Csv2Json = (
  fileName: string,
  option?: CsvReadOption,
): GyomuResultAsync<Record<string, string>[]> => {
  const stream: ReadStream | NodeJS.ReadWriteStream =
    platform.createReadStream(fileName);

  return CsvStream2Json(stream, option);
};

export const Csv2Csv = (
  inputFilename: string,
  outputFilename: string,
  inputOption?: CsvReadOption,
  outputOption?: Omit<CsvWriteOption, 'outputFilename'>,
) => {
  let inputStream: ReadStream | NodeJS.ReadWriteStream =
    platform.createReadStream(inputFilename);
  const outputStream = platform.createWriteStream(outputFilename);

  const inputCsvOption: csv.parser.Options = {
    columns: true,
    bom: false,
  };

  if (inputOption?.bom) {
    inputCsvOption.bom = true;
  }
  if (inputOption?.fields) {
    inputCsvOption.columns = inputOption.fields;
  }
  if (inputOption?.encoding) {
    inputStream = inputStream.pipe(createDecoder(inputOption.encoding));
  }

  const outputCsvOption: csv.stringifier.Options = {
    header: true,
    record_delimiter: 'windows',
    eof: false,
  };
  outputCsvOption.quoted = outputOption?.quoted;
  outputCsvOption.bom = outputOption?.bom;
  if (!outputCsvOption.bom) {
    outputCsvOption.bom = false;
  }
  if (outputOption?.fields) {
    outputCsvOption.columns = undefined;
    const fields = outputOption.fields as Record<string, string>;
    const fieldInfo: csv.stringifier.ColumnOption[] = [];
    for (const key of Object.keys(fields)) {
      fieldInfo.push({ header: fields[key], key });
    }
    outputCsvOption.columns = fieldInfo;
  }

  return runAsync(
    () =>
      new Promise<boolean>((resolve, reject) => {
        if (inputOption?.filterFn) {
          const filterFn = inputOption.filterFn;
          const transformer = csv.transform((record) => {
            return filterFn(record as Record<string, string>) ? record : null;
          });
          pipeline(
            inputStream,
            csv.parse(inputCsvOption),
            transformer,
            csv.stringify(outputCsvOption),
            outputStream,
            (err) => {
              if (err) {
                console.error('Error:', err);
                reject(new IOError('fail to create csv file from csv', err));
              } else resolve(true);
            },
          );
        } else {
          pipeline(
            inputStream,
            csv.parse(inputCsvOption),
            csv.stringify(outputCsvOption),
            outputStream,
            (err) => {
              if (err) {
                console.error('Error:', err);
                reject(new IOError('fail to create csv file from csv', err));
              } else resolve(true);
            },
          );
        }
      }),
    IOError,
    `fail to create csv file from csv`,
  );
};

type csvParseInput = Options;
export async function* parseCsv(
  source: CsvSource,
  inputOption?: CsvReadOption,
): AsyncGenerator<Record<string, string>> {
  const inputCsvOption: csvParseInput = {
    columns: true,
    bom: false,
    skip_empty_lines: true,
    trim: true,
  };

  if (inputOption?.bom) {
    inputCsvOption.bom = true;
  }
  if (inputOption?.fields) {
    inputCsvOption.columns = inputOption.fields;
  }
  if (inputOption?.encoding) {
    if (inputOption.encoding != 'utf8')
      source.stream.pipe(createDecoder(inputOption.encoding));
  }

  const parser = source.stream.pipe(parse(inputCsvOption));

  for await (const row of parser) {
    yield row as Record<string, string>;
  }
}

export async function* rowsFromZip(zipPath: FileInput, csvName: string) {
  for await (const src of ZipArchive.fromZip(zipPath, csvName)) {
    yield* parseCsv(src);
  }
}

export async function* rowsFromGzip(gzipPath: FileInput) {
  for await (const src of GzipArchive.fromGZip(gzipPath)) {
    yield* parseCsv(src);
  }
}
