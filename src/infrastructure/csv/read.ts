import { Schema, Stream, Function, Option, Effect } from 'effect';
import { AppError } from '../../base-error.js';
import { IOError } from '../../errors.js';
import { throughNodeStream } from '../stream/bridge/nodeStream.js';
import { CsvColumn, CsvReadOption } from './type.js';
import { parse, Options } from 'csv-parse';

export const parseCsv =
  <A, E extends AppError, R = never>(options?: CsvReadOption<A>) =>
  (
    stream: Stream.Stream<string | Buffer | Uint8Array, E | IOError, R>,
  ): Stream.Stream<Record<string, string>, E | IOError, R> =>
    Function.pipe(
      stream,
      throughNodeStream<string | Buffer | Uint8Array, Record<string, string>>(
        parse(convertReadOption(options)),
      ),
    );

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
        const opt = Schema.decodeUnknownOption(schema as any)(input);

        return {
          ok: Option.isSome(opt),
          value: Option.getOrUndefined(opt),
          raw: input,
        };
      }),
    );

export const readCsv =
  <A, E extends AppError, R = never>(
    schema: Schema.Schema<A>,
    options?: CsvReadOption<Schema.Schema.Type<Schema.Schema<A>>>,
  ) =>
  (stream: Stream.Stream<string | Buffer | Uint8Array, E, R>) =>
    stream.pipe(
      parseCsv(options),
      Stream.filter((row) =>
        options?.filterRaw ? options.filterRaw(row) : true,
      ),
      decodeCsv(schema),
      Stream.tap((row) =>
        Effect.sync(() => {
          if (!row.ok) options?.onInvalidRow?.(row.raw);
        }),
      ),
      Stream.filter((row) => row.ok),
      Stream.map((row) => row.value as A),
      Stream.filter((row) => (options?.filter ? options.filter(row) : true)),
    );

export const readCsvRaw =
  <E extends AppError, R = never>(
    options?: CsvReadOption<Record<string, string>>,
  ) =>
  (stream: Stream.Stream<string | Buffer, E, R>) =>
    stream.pipe(
      parseCsv(options),
      Stream.filter((row) =>
        options?.filterRaw ? options.filterRaw(row) : true,
      ),
    );

const convertReadOption = <R>(options?: CsvReadOption<R>) => {
  const inputCsvOption: Options = {
    columns: true,
    bom: false,
    skip_empty_lines: true,
    trim: true,
  };

  if (options?.bom) {
    inputCsvOption.bom = true;
  }
  if (options?.fields) {
    const fields = options.fields;
    inputCsvOption.columns = (headers) =>
      headers.map((h) => buildHeaderMap(fields)[h] ?? h);
  }
  return inputCsvOption;
};

function buildHeaderMap<R>(fields: readonly CsvColumn<R>[]) {
  const map: Record<string, string> = {};

  for (const f of fields) {
    map[f.header ?? f.key] = f.key;
  }

  return map;
}
