import { Effect, Function, Option, Schema, Stream } from 'effect'
import { IOError } from '@gyomu/schema'
import { parse } from 'csv-parse'
import { throughNodeStream } from '../stream/bridge/nodeStream.js'
import type { Options } from 'csv-parse'
import type { CsvColumn, CsvReadOption } from './type.js'

/**
 * Parses a CSV stream into a stream of records.
 *
 * @param options Optional configuration for parsing.
 *
 * @returns A function that takes a CSV stream and returns a stream of parsed record objects.
 */
export const parseCsv =
  <A, R = never>(options?: CsvReadOption<A>) =>
  (
    stream: Stream.Stream<string | Buffer | Uint8Array, IOError, R>,
  ): Stream.Stream<Record<string, string>, IOError, R> =>
    Function.pipe(
      stream,
      throughNodeStream<string | Buffer | Uint8Array, Record<string, string>>(
        parse(convertReadOption(options)),
      ),
    )

// const decodeCsv_Old =
//   <A>(schema: Schema.Schema<A>, skipInvalid?: boolean) =>
//   <E extends AppError = never, R = never>(
//     stream: Stream.Stream<unknown, E, R>,
//   ) => {
//     return skipInvalid
//       ? stream.pipe(
//           Stream.filterMap((input) => {
//             const decode = Schema.decodeUnknownOption(schema as any) as (
//               input: unknown,
//             ) => Option.Option<A>;
//             const opt = decode(input);
//             // Option を Result<A, void> に変換します。
//             // Result.fromOption の第2引数は「失敗（スキップ）」時の値（voidなど）です。
//             return Result.fromOption(opt, () => undefined);
//           }),
//         )
//       : stream.pipe(
//           Stream.mapEffect((input) =>
//             Schema.decodeUnknownEffect(schema)(input),
//           ),
//         );
//   };

const decodeCsv =
  <A>(schema: Schema.Schema<A>) =>
  <E, R>(stream: Stream.Stream<unknown, E, R>) =>
    stream.pipe(
      Stream.map((input) => {
        const opt = Schema.decodeUnknownOption(schema as any)(input)

        return {
          ok: Option.isSome(opt),
          value: Option.getOrUndefined(opt),
          raw: input,
        }
      }),
    )

/**
 * Reads and decodes a CSV stream against a schema.
 *
 * @param schema The schema to decode rows against.
 *
 * @param options Optional configuration, including filtering and error handling.
 *
 * @returns A function that consumes a stream and yields typed rows.
 */
export const readCsv =
  <A, R = never>(
    schema: Schema.Schema<A>,
    options?: CsvReadOption<Schema.Schema.Type<Schema.Schema<A>>>,
  ) =>
  (stream: Stream.Stream<string | Buffer | Uint8Array, IOError, R>) =>
    stream.pipe(
      parseCsv(options),
      Stream.filter((row) => (options?.filterRaw ? options.filterRaw(row) : true)),
      decodeCsv(schema),
      Stream.tap((row) =>
        Effect.sync(() => {
          if (!row.ok) options?.onInvalidRow?.(row.raw)
        }),
      ),
      Stream.flatMap((row) =>
        row.ok
          ? Stream.succeed(row.value as A)
          : options?.skipInvalidRows
            ? Stream.empty
            : Stream.fail(
                new IOError({
                  message: 'Invalid CSV row',
                  cause: {
                    row: row.raw,
                    error: row.value,
                  },
                  layer: 'csv' as const,
                  operation: 'read' as const,
                }),
              ),
      ),
      Stream.filter((row) => (options?.filter ? options.filter(row) : true)),
    )

/**
 * Reads a CSV stream and returns raw string-to-string records.
 *
 * @param options Optional configuration for reading raw CSV data.
 *
 * @returns A function that consumes a stream and yields parsed raw records.
 */
export const readCsvRaw =
  <R = never>(options?: CsvReadOption<Record<string, string>>) =>
  (stream: Stream.Stream<string | Buffer, IOError, R>) =>
    stream.pipe(
      parseCsv(options),
      Stream.filter((row) => (options?.filterRaw ? options.filterRaw(row) : true)),
    )

const convertReadOption = <R>(options?: CsvReadOption<R>) => {
  const inputCsvOption: Options = {
    columns: true,
    bom: false,
    skip_empty_lines: true,
    trim: true,
  }

  if (options?.bom) {
    inputCsvOption.bom = true
  }
  if (options?.fields) {
    const fields = options.fields
    inputCsvOption.columns = (headers) => headers.map((h) => buildHeaderMap(fields)[h] ?? h)
  }
  return inputCsvOption
}

function buildHeaderMap<R>(fields: ReadonlyArray<CsvColumn<R>>) {
  const map: Record<string, string> = {}

  for (const f of fields) {
    map[f.header || f.key] = f.key
  }

  return map
}
