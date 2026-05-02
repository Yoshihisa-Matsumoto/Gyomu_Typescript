import { Stream } from 'effect';
import { isRetryableNetworkError, NetworkError } from '@gyomu/core';
import { wrapInfraError } from '@gyomu/shared';

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
