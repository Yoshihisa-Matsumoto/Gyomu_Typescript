import { Effect, Stream } from 'effect'
import { NetworkError, isRetryableNetworkError } from '@gyomu/schema'
import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici'
import { fromPromise } from '@gyomu/schema/effect'

export function simpleWebAccess(url: string, isInternal: boolean = true) {
  if (!isInternal && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY)) {
    setGlobalDispatcher(new EnvHttpProxyAgent())
  }
  return fetch(url)
}

export const fetchStream = (
  url: string,
  options?: RequestInit,
): Stream.Stream<Uint8Array, NetworkError> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const response = yield* fetchEffect(url, options)

      if (!response.ok) {
        return yield* Effect.fail(
          new NetworkError({
            message: `HTTP Error: ${response.status}`,
            cause: response.status,
            retryable: isRetryableNetworkError(response),
            operation: 'request',
            endpoint: url,
          }),
        )
      }

      if (!response.body) {
        return yield* Effect.fail(
          new NetworkError({
            message: 'No response body',
            endpoint: url,
            cause: undefined,
            operation: 'request',
            retryable: false,
          }),
        )
      }

      return Stream.fromReadableStream({
        evaluate: () => response.body!,
        onError: (e) =>
          new NetworkError({
            message: 'Stream error',
            operation: 'request',
            cause: e,
            retryable: isRetryableNetworkError(e),
            endpoint: url,
          }),
      })
    }),
  )
export const fetchEffect = (url: string, init?: RequestInit) =>
  fromPromise(NetworkError, (e) => ({
    message: 'Fetch Error',
    operation: 'request' as const,
    retryable: isRetryableNetworkError(e),
    endpoint: url,
  }))(() => fetch(url, init))
