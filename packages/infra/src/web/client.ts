import { Effect, Stream } from 'effect'
import { NetworkError, isRetryableNetworkError } from '@gyomu/schema'
import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici'
import { fromPromise } from '@gyomu/schema/effect'

/**
 * Performs a web request using the fetch API, optionally configuring an HTTP proxy if the request is not internal.
 *
 * @param url The URL to request.
 *
 * @param isInternal Whether the request is to an internal resource. Defaults to true.
 *
 * @returns A Promise resolving to the Response object.
 */
export function simpleWebAccess(url: string, isInternal: boolean = true) {
  if (!isInternal && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY)) {
    setGlobalDispatcher(new EnvHttpProxyAgent())
  }
  return fetch(url)
}

/**
 * Fetches a resource and returns a stream of its body content, or fails with a NetworkError if the request is unsuccessful.
 *
 * @param url The URL to fetch.
 *
 * @param options Optional request configuration.
 *
 * @returns A Stream emitting Uint8Array chunks, or a failure with a NetworkError.
 */
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

/**
 * Performs a fetch request wrapped in an Effect, converting errors into a NetworkError.
 *
 * @param url The URL to fetch.
 *
 * @param init Optional fetch initialization options.
 *
 * @returns An Effect representing the fetch operation, resulting in a Response or a NetworkError.
 */
export const fetchEffect = (url: string, init?: RequestInit) =>
  fromPromise(NetworkError, (e) => ({
    message: 'Fetch Error',
    operation: 'request' as const,
    retryable: isRetryableNetworkError(e),
    endpoint: url,
  }))(() => fetch(url, init))
