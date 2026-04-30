import { Client } from 'ssh2';
import { IOError, isRetryableNetworkError, NetworkError } from '@gyomu/core';
import { Effect, Stream } from 'effect';
import { withSftp } from './shared.js';
import { NodeStream } from '@effect/platform-node';
import { Writable } from 'node:stream';

export const uploadFromStreamUnderNodejs =
  (client: Client) =>
  <R>(
    source: Stream.Stream<Uint8Array, IOError, R>,
    remotePath: string,
  ): Effect.Effect<void, NetworkError, R> =>
    withSftp(client)((sftp) =>
      Effect.scoped(
        Effect.gen(function* () {
          const readable = yield* NodeStream.toReadable(source);

          const writable = yield* Effect.callback<Writable, NetworkError>(
            (resume) => {
              try {
                const ws = sftp.createWriteStream(remotePath);

                const onOpen = () => {
                  cleanup();
                  resume(Effect.succeed(ws));
                };

                const onError = (err: Error) => {
                  cleanup();
                  resume(
                    Effect.fail(
                      new NetworkError({
                        message: `Fail to open remote file`,
                        cause: err,
                        retryable: isRetryableNetworkError(err),
                        operation: 'upload',
                        endpoint: remotePath,
                      }),
                    ),
                  );
                };

                const cleanup = () => {
                  ws.off('open', onOpen);
                  ws.off('error', onError);
                };

                ws.on('open', onOpen);
                ws.on('error', onError);
              } catch (e) {
                resume(
                  Effect.fail(
                    new NetworkError({
                      message: 'fail to create write stream',
                      cause: e,
                      operation: 'upload',
                      retryable: isRetryableNetworkError(e),
                      endpoint: remotePath,
                    }),
                  ),
                );
              }
            },
          );

          // 🔥 ここが重要
          yield* Effect.acquireRelease(
            Effect.sync(() => {
              readable.pipe(writable);
              return { readable, writable };
            }),
            ({ readable, writable }) =>
              Effect.sync(() => {
                // interrupt時も確実に閉じる
                readable.destroy?.();
                writable.destroy?.();
              }),
          ).pipe(
            Effect.flatMap(() =>
              Effect.callback<void, NetworkError>((resume) => {
                const onFinish = () => {
                  cleanup();
                  resume(Effect.succeed(undefined));
                };

                const onError = (err: Error) => {
                  cleanup();
                  resume(
                    Effect.fail(
                      new NetworkError({
                        message: 'upload fail',
                        cause: err,
                        operation: 'upload',
                        retryable: isRetryableNetworkError(err),
                        endpoint: remotePath,
                      }),
                    ),
                  );
                };

                const cleanup = () => {
                  readable.off('error', onError);
                  writable.off('error', onError);
                  writable.off('finish', onFinish);
                  writable.off('close', onFinish); // 🔥 念のため
                };

                readable.on('error', onError);
                writable.on('error', onError);
                writable.on('finish', onFinish);
                writable.on('close', onFinish);

                return Effect.sync(cleanup);
              }),
            ),
          );
        }),
      ),
    );
