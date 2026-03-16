import { Schema, Stream, Function, Result } from 'effect';
import { AppError } from '../../base-error.js';
import { IOError } from '../../errors.js';
import { throughNodeStream } from '../nodeStream.js';
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

const decodeCsv =
  <S extends Schema.Schema<any> & { readonly DecodingServices: never }>(
    schema: S,
    skipInvalid?: boolean,
  ) =>
  <E, R>(stream: Stream.Stream<unknown, E, R>) => {
    return skipInvalid
      ? stream.pipe(
          Stream.filterMap((input) => {
            const opt = Schema.decodeUnknownOption(schema)(input);
            // Option を Result<A, void> に変換します。
            // Result.fromOption の第2引数は「失敗（スキップ）」時の値（voidなど）です。
            return Result.fromOption(opt, () => undefined);
          }),
        )
      : stream.pipe(
          Stream.mapEffect((input) =>
            Schema.decodeUnknownEffect(schema)(input),
          ),
        );
  };

export const readCsv =
  <
    S extends Schema.Schema<any> & { readonly DecodingServices: never },
    E extends AppError,
    R = never,
  >(
    schema: S,
    options?: CsvReadOption<Schema.Schema.Type<S>>,
  ) =>
  (stream: Stream.Stream<string | Buffer | Uint8Array, E, R>) =>
    stream.pipe(
      parseCsv(options),
      Stream.filter((row) =>
        options?.filterRaw ? options.filterRaw(row) : true,
      ),
      decodeCsv(schema, options?.invalidRowSkip),
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
