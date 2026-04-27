import { Effect } from 'effect';
import { Stream } from 'effect';
import { NetworkError } from '../../errors.js';
import { fromPromise } from '@gyomu/shared/effect';
import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';
import { networkStream } from '../../shared/effect/stream.js';

export function simpleWebAccess(url: string, isInternal: boolean = true) {
  if (!isInternal && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY)) {
    setGlobalDispatcher(new EnvHttpProxyAgent());
  }
  return fetch(url);
}

export const fetchStream = (
  url: string,
  options?: RequestInit,
): Stream.Stream<Uint8Array, NetworkError> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const response = yield* fetchEffect(url, options);

      if (!response.ok) {
        return yield* Effect.fail(
          new NetworkError(`HTTP Error: ${response.status} ${url}`),
        );
      }

      if (!response.body) {
        return yield* Effect.fail(new NetworkError(`No response body: ${url}`));
      }

      return Stream.fromReadableStream({
        evaluate: () => response.body!,
        onError: (e) => new NetworkError(`Stream error: ${String(e)} (${url})`),
      });
    }),
  );
export const fetchEffect = (url: string, init?: RequestInit) =>
  fromPromise(NetworkError, `Fetch Error to ${url}`)(() => fetch(url, init));
export const webDownloadStream = (
  url: string,
  headers?: Record<string, string>,
): Stream.Stream<Uint8Array, NetworkError> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const response = yield* fetchEffect(url, { headers });

      if (!response.body) {
        return yield* Effect.fail(new NetworkError('No response body'));
      }

      return networkStream(() => response.body!, `Stream error `);
    }),
  );
