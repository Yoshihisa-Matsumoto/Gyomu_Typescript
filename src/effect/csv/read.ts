import { Schema, Stream, Function } from '..';
import { AppError } from '../../base-error';
import { IOError } from '../../errors';
import { throughNodeStream } from '../nodeStream';
import { CsvColumn, CsvReadOption, CsvRow } from './type';
import { parse, Options } from 'csv-parse';

export const parseCsv =
  <A, E extends AppError, R = never>(options?: CsvReadOption<A>) =>
  (
    stream: Stream.Stream<string | Buffer, E | IOError, R>,
  ): Stream.Stream<Record<string, string>, E | IOError, R> =>
    Function.pipe(
      stream,
      throughNodeStream<string | Buffer, Record<string, string>, E | IOError>(
        parse(convertReadOption(options)),
      ),
    );

export const decodeCsv = <A, I>(schema: Schema.Schema<A, I>) =>
  Stream.map(Schema.decodeUnknownSync(schema));

export const readCsv =
  <A extends CsvRow, I, E extends AppError, R = never>(
    schema: Schema.Schema<A, I>,
    options?: CsvReadOption<A>,
  ) =>
  (stream: Stream.Stream<string | Buffer, E, R>) =>
    stream.pipe(
      parseCsv(options),
      Stream.filter((row) =>
        options?.filterRaw ? options.filterRaw(row) : true,
      ),
      decodeCsv(schema),
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
