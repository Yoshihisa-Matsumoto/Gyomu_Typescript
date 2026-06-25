import { Stream } from 'effect'

/**
 * Creates a stream from a factory function that returns a ReadableStream.
 *
 * @param onError A function that maps unknown errors to the expected error type E.
 *
 * @param f A factory function that returns a ReadableStream.
 *
 * @returns A Stream that reads data from the provided ReadableStream.
 */
export const fromReadableStream =
  <E>(onError: (e: unknown) => E) =>
  (f: () => ReadableStream<Uint8Array>): Stream.Stream<Uint8Array, E> =>
    Stream.fromReadableStream({
      evaluate: f,
      onError,
    })
