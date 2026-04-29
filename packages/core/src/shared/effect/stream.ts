import { Stream } from 'effect';
import { isRetryableNetworkError, NetworkError } from '../../errors.js';
import { wrapInfraError } from '@gyomu/shared';

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
    onError: (e) =>
      wrapInfraError(NetworkError, e, (e) => ({
        message: 'fail to read stream',
        operation: 'download' as const,
        endpoint: context,
        retryable: isRetryableNetworkError(e),
      })),
  });
