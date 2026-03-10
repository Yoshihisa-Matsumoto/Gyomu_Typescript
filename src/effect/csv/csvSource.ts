export type CsvSource =
  | AsyncIterable<string | Buffer | Uint8Array>
  | NodeJS.ReadableStream;

export function toAsyncIterable(source: CsvSource): AsyncIterable<Uint8Array> {
  if (Symbol.asyncIterator in source) {
    return source as AsyncIterable<Uint8Array>;
  }

  return source as AsyncIterable<Uint8Array>;
}
