import { platform } from '../fs/index.js';
import { CsvRow, CsvValue, CsvWriteOption } from './type.js';
import { stringify } from 'csv';
import { Options } from 'csv-stringify';
import { throughNodeStreamScoped } from '../stream/bridge/nodeStream.js';
import { Stream, Schema, Function, Effect, Console } from 'effect';
import { AppError } from '../../base-error.js';
import { IOError, unknownError } from '../../errors.js';
import { FileSystem } from 'effect/FileSystem';
import { encodeUtf8ToBinaryStream } from '../../shared/stream/transform/encoding.js';
import { NodeFileSystem } from '@effect/platform-node';

// export const CsvBoolean = Schema.BooleanFromString;

// export const CsvDate = Schema.DateFromString;

// export const getColumns = <F extends Schema.Struct.Fields>(
//   schema: Schema.Struct<F>,
// ) => Object.keys(schema.fields) as (keyof F & string)[];

const stringifyCsv =
  <S extends Schema.Struct.Fields>(
    schema: Schema.Struct<S>,
    options?: CsvWriteOption<S>,
  ) =>
  <E extends AppError = never, R = never>(
    stream: Stream.Stream<CsvRow, E, R>,
  ) =>
    stream.pipe(
      throughNodeStreamScoped<CsvRow, string>(() =>
        stringify({
          ...convertOption(options),
          columns: Object.keys(schema.fields),
        }),
      ),
    );
const stringifyCsvRaw =
  (options?: CsvWriteOption<CsvRow>) =>
  <E extends AppError = never, R = never>(
    stream: Stream.Stream<CsvRow, E, R>,
  ): Stream.Stream<string, E | IOError, R> =>
    Function.pipe(
      stream,
      throughNodeStreamScoped<CsvRow, string>(() =>
        stringify({
          ...convertOption(options),
        }),
      ),
    );

type StructType<F extends Schema.Struct.Fields> = Schema.Schema.Type<
  Schema.Struct<F>
>;
const encodeCsv =
  <F extends Schema.Struct.Fields>(schema: Schema.Struct<F>) =>
  <E extends AppError = never, R = never>(
    stream: Stream.Stream<StructType<F>, E, R>,
  ) =>
    stream.pipe(
      Stream.mapEffect((r) =>
        Schema.encodeEffect(schema)(r).pipe(
          Effect.mapError((e) =>
            unknownError(IOError, e, 'Failed to encode CSV row'),
          ),
        ),
      ),
      Stream.map((r) => r as CsvRow),
    );

export const writeCsv =
  <F extends Schema.Struct.Fields, E extends AppError = never, R = never>(
    schema: Schema.Struct<F>,
    options?: CsvWriteOption<F>,
  ) =>
  (stream: Stream.Stream<StructType<F>, E, R>) =>
    stream.pipe(encodeCsv(schema), stringifyCsv(schema, options));

export const writeCsvRaw =
  <T extends Record<string, CsvValue>, E extends AppError = never, R = never>(
    options?: CsvWriteOption<CsvRow>,
  ) =>
  (stream: Stream.Stream<T, E, R>) =>
    stream.pipe(stringifyCsvRaw(options));

type CsvOutput =
  | { type: 'string' }
  | { type: 'file'; path: string }
  | { type: 'console' };

export const jsonToCsv = <T extends Record<string, any>>(
  records: T[],
  options?: CsvWriteOption<CsvRow>,
  output: CsvOutput = { type: 'string' },
) =>
  Stream.fromIterable(records).pipe(
    Stream.map((row): CsvRow => row as CsvRow),
    writeCsvRaw(options),
    (stream) => {
      switch (output.type) {
        case 'string':
          return stream.pipe(
            Stream.runCollect,
            Effect.map((chunks) => chunks.join('')),
          );
        case 'console':
          return stream.pipe(Stream.runForEach(Console.log));
        case 'file':
          return Effect.gen(function* () {
            const fs = yield* FileSystem;
            yield* fs.makeDirectory(platform.dirname(output.path), {
              recursive: true,
            });
            yield* stream.pipe(
              encodeUtf8ToBinaryStream,
              Stream.run(fs.sink(output.path)),
            );
          });
      }
    },
  );
export const jusonToCsvRun = async <T extends Record<string, any>>(
  records: T[],
  options?: CsvWriteOption<CsvRow>,
  output: CsvOutput = { type: 'string' },
) => {
  return Effect.runPromise(
    jsonToCsv(records, options, output).pipe(
      Effect.provide(NodeFileSystem.layer),
    ),
  );
};

const convertOption = <R>(options?: CsvWriteOption<R>): Options => {
  const csvOptions: Options = {
    header: true,
    quoted: options?.quoted ?? false,
    bom: options?.bom ?? false,
    record_delimiter:
      options?.recordDelimiter ??
      (platform.name == 'linux' ? 'unix' : 'windows'),
  };
  if (options?.fields) {
    csvOptions.columns = options.fields.map((f) => ({
      key: f.key,
      header: f.header,
    }));
  }
  return csvOptions;
};
