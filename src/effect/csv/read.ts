import { parseCsv } from './csvParser';
import { Stream, Effect } from '..';
import { csvRows } from './csvRows';
import { CsvSource, toAsyncIterable } from './csvSource';
import { CsvReadOption } from './type';
import { decode } from '../../encoding/decode';

export function readCsv(
  source: CsvSource,
  options?: Pick<CsvReadOption, 'filterFn' | 'encoding'>,
) {
  const iterable = toAsyncIterable(source);
  const decoded = options?.encoding
    ? decodeEncoding(iterable, options.encoding)
    : iterable;

  let stream = csvRows(parseCsv(decoded));

  if (options?.filterFn) {
    stream = stream.pipe(Stream.filter(options.filterFn));
  }

  return stream;
}
export function collectCsv(
  source: CsvSource,
  options?: Pick<CsvReadOption, 'filterFn' | 'encoding'>,
) {
  return readCsv(source, options).pipe(
    Stream.runCollect,
    Effect.map((rows) => Array.from(rows)),
  );
}

export function readCsvDecoded<T>(
  source: CsvSource,
  decoder: (row: Record<string, string>) => T,
  options?: Pick<CsvReadOption, 'filterFn'>,
) {
  return readCsv(source, options).pipe(Stream.map(decoder));
}

async function* decodeEncoding(
  source: AsyncIterable<Uint8Array>,
  encoding: string,
): AsyncIterable<string> {
  for await (const chunk of source) {
    yield decode(chunk, encoding);
  }
}
