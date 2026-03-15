import { platform } from '../../platform/index.js';
import { CsvRow, CsvWriteOption } from './type.js';
import { stringify } from 'csv';
import { Options } from 'csv-stringify';
import { throughNodeStreamScoped } from '../nodeStream.js';
import { Stream, Schema } from 'effect';

export const CsvBoolean = Schema.BooleanFromString;

export const CsvDate = Schema.DateFromString;

export const getColumns = <F extends Schema.Struct.Fields>(
  schema: Schema.Struct<F>,
) => Object.keys(schema.fields) as (keyof F & string)[];

export const stringifyCsv = <R extends Schema.Struct.Fields>(
  schema: Schema.Struct<R>,
  options?: CsvWriteOption<R>,
) =>
  throughNodeStreamScoped<CsvRow, string>(() =>
    stringify({
      ...convertOption(options),
      columns: Object.keys(schema.fields),
    }),
  );
type StructType<F extends Schema.Struct.Fields> = Schema.Schema.Type<
  Schema.Struct<F>
>;
export const encodeCsv =
  <F extends Schema.Struct.Fields>(schema: Schema.Struct<F>) =>
  (stream: Stream.Stream<StructType<F>>) =>
    stream.pipe(
      Stream.map(
        (r) =>
          Schema.encodeSync(
            schema as unknown as Schema.Schema<StructType<F>, any, never>,
          )(r) as CsvRow,
      ),
    );

export const writeCsv =
  <F extends Schema.Struct.Fields>(
    schema: Schema.Struct<F>,
    options?: CsvWriteOption<F>,
  ) =>
  (stream: Stream.Stream<StructType<F>>) =>
    stream.pipe(encodeCsv(schema), stringifyCsv(schema, options));

const convertOption = <R>(options?: CsvWriteOption<R>): Options => {
  const csvOptions: Options = {
    header: true,
    quoted: options?.quoted ?? false,
    bom: options?.bom ?? false,
    record_delimiter: platform.name == 'linux' ? 'unix' : 'windows',
  };
  if (options?.fields) {
    csvOptions.columns = options.fields.map((f) => ({
      key: f.key,
      header: f.header,
    }));
  }
  return csvOptions;
};
