import { Stream } from 'effect'
import { NetworkError, isRetryableNetworkError, wrapInfraError } from '@gyomu/core'

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
