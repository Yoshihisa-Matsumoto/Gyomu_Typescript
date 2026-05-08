import { Stream } from 'effect';

export const fromReadableStream =
  <E>(onError: (e: unknown) => E) =>
  (f: () => ReadableStream<Uint8Array>): Stream.Stream<Uint8Array, E> =>
    Stream.fromReadableStream({
      evaluate: f,
      onError,
    });
