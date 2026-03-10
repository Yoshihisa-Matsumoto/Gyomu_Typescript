import { parse, Options } from 'csv-parse';
import { CsvReadOption } from './type';

export function parseCsv(
  source: AsyncIterable<string | Uint8Array>,
  option?: Exclude<CsvReadOption, 'filterFn' | 'encoding'>,
): AsyncIterable<Record<string, string>> {
  const inputCsvOption: Options = {
    columns: true,
    bom: false,
    skip_empty_lines: true,
    trim: true,
  };

  if (option?.bom) {
    inputCsvOption.bom = true;
  }
  if (option?.fields) {
    inputCsvOption.columns = option.fields;
  }
  const parser = parse(inputCsvOption);

  (async () => {
    for await (const chunk of source) {
      parser.write(chunk);
    }
    parser.end();
  })();

  return parser;
}
