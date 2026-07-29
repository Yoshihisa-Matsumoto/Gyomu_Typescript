import { Stream } from 'effect'
import { NetworkError, isRetryableNetworkError, wrapInfraError } from '@gyomu/schema'

/**
 * Creates a stream from a ReadableStream factory, wrapping internal errors as NetworkError instances.
 *
 * @param f A factory function that returns the ReadableStream to be wrapped.
 *
 * @param context The endpoint or identifier used for error reporting.
 *
 * @returns A wrapped stream that handles network errors during reading.
 */
export const networkStream = (f: () => ReadableStream<Uint8Array>, context: string) =>
  Stream.fromReadableStream({
    evaluate: f,
    onError: (e) =>
      wrapInfraError(NetworkError, e, (e2) => ({
        message: 'fail to read stream',
        operation: 'download' as const,
        endpoint: context,
        retryable: isRetryableNetworkError(e2),
      })),
  })
