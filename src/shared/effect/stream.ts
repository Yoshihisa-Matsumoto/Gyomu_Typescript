import { Stream } from 'effect';
import { NetworkError } from '../../errors.js';

export const fromReadableStream =
  <E>(onError: (e: unknown) => E) =>
  (f: () => ReadableStream<Uint8Array>): Stream.Stream<Uint8Array, E> =>
    Stream.fromReadableStream({
      evaluate: f,
      onError,
    });
export const networkStream = (
  f: () => ReadableStream<Uint8Array>,
  context: string,
) =>
  Stream.fromReadableStream({
    evaluate: f,
    onError: (e) => new NetworkError(`${context}: ${String(e)}`),
  });
