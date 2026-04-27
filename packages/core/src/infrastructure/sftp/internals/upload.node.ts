import { Client } from 'ssh2';
import { NetworkError } from '../../../errors.js';
import { Effect, Stream } from 'effect';
import { AppError } from '../../../base-error.js';
import { withSftp } from './shared.js';
import { NodeStream } from '@effect/platform-node';
import { Writable } from 'node:stream';

export const uploadFromStreamUnderNodejs =
  (client: Client) =>
  <E extends AppError, R>(
    source: Stream.Stream<Uint8Array, E, R>,
    remotePath: string,
  ): Effect.Effect<void, E | NetworkError, R> =>
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
                      new NetworkError(
                        `Failed to open remote file: ${err.message}`,
                      ),
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
                    new NetworkError(
                      `Failed to create write stream: ${String(e)}`,
                    ),
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
                      new NetworkError(`Upload failed: ${err.message}`),
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
