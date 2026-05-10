import path from 'node:path'
import { stringify } from 'csv'
import { Console, Effect, Function, Layer, Schema, Stream } from 'effect'
import { IOError, wrapInfraError } from '@gyomu/core'
import { encodeUtf8ToBinaryStream } from '@gyomu/core/shared/stream'
import { NodeFileSystem, NodePath } from '@effect/platform-node'
import { throughNodeStreamScoped } from '../stream/bridge/nodeStream.js'
import { makeDirectory, writeStreamToFile } from '../fs/fs-utils.js'
import type { Options } from 'csv-stringify'
import type { CsvRow, CsvValue, CsvWriteOption } from './type.js'

// export const CsvBoolean = Schema.BooleanFromString;

// export const CsvDate = Schema.DateFromString;

// export const getColumns = <F extends Schema.Struct.Fields>(
//   schema: Schema.Struct<F>,
// ) => Object.keys(schema.fields) as (keyof F & string)[];

const stringifyCsv =
  <S extends Schema.Struct.Fields>(schema: Schema.Struct<S>, options?: CsvWriteOption<S>) =>
  <R = never>(stream: Stream.Stream<CsvRow, IOError, R>) =>
    stream.pipe(
      throughNodeStreamScoped<CsvRow, string>(() =>
        stringify({
          ...convertOption(options),
          columns: Object.keys(schema.fields),
        }),
      ),
    )
const stringifyCsvRaw =
  (options?: CsvWriteOption<CsvRow>) =>
  <R = never>(stream: Stream.Stream<CsvRow, IOError, R>): Stream.Stream<string, IOError, R> =>
    Function.pipe(
      stream,
      throughNodeStreamScoped<CsvRow, string>(() =>
        stringify({
          ...convertOption(options),
        }),
      ),
    )

type StructType<F extends Schema.Struct.Fields> = Schema.Schema.Type<Schema.Struct<F>>
const encodeCsv =
  <F extends Schema.Struct.Fields>(schema: Schema.Struct<F>) =>
  <R = never>(stream: Stream.Stream<StructType<F>, IOError, R>) =>
    stream.pipe(
      Stream.mapEffect((r) =>
        Schema.encodeEffect(schema)(r).pipe(
          Effect.mapError((e) =>
            wrapInfraError(IOError, e, () => ({
              message: 'Failed to encode stream into CSV row',
              layer: 'csv' as const,
              operation: 'transform' as const,
            })),
          ),
        ),
      ),
      Stream.map((r) => r as CsvRow),
    )

export const writeCsv =
  <F extends Schema.Struct.Fields, R = never>(
    schema: Schema.Struct<F>,
    options?: CsvWriteOption<F>,
  ) =>
  (stream: Stream.Stream<StructType<F>, IOError, R>) =>
    stream.pipe(encodeCsv(schema), stringifyCsv(schema, options))

export const writeCsvRaw =
  <T extends Record<string, CsvValue>, R = never>(options?: CsvWriteOption<CsvRow>) =>
  (stream: Stream.Stream<T, IOError, R>) =>
    stream.pipe(stringifyCsvRaw(options))

type CsvOutput = { type: 'string' } | { type: 'file'; path: string } | { type: 'console' }

export const jsonToCsv = <T extends Record<string, any>>(
  records: Array<T>,
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
          )
        case 'console':
          return stream.pipe(Stream.runForEach(Console.log))
        case 'file':
          return Effect.gen(function* () {
            yield* makeDirectory(path.dirname(output.path))
            yield* writeStreamToFile(output.path)(stream.pipe(encodeUtf8ToBinaryStream))
          })
      }
    },
  )
export const jusonToCsvRun = async <T extends Record<string, any>>(
  records: Array<T>,
  options?: CsvWriteOption<CsvRow>,
  output: CsvOutput = { type: 'string' },
) => {
  return Effect.runPromise(
    jsonToCsv(records, options, output).pipe(
      Effect.provide(NodeFileSystem.layer.pipe(Layer.merge(NodePath.layer))),
    ),
  )
}

const convertOption = <R>(options?: CsvWriteOption<R>): Options => {
  const csvOptions: Options = {
    header: true,
    quoted: options?.quoted ?? false,
    bom: options?.bom ?? false,
    record_delimiter:
      options?.recordDelimiter ?? (process.platform === 'win32' ? 'windows' : 'unix'),
  }
  if (options?.fields) {
    csvOptions.columns = options.fields.map((f) => ({
      key: f.key,
      header: f.header,
    }))
  }
  return csvOptions
}
