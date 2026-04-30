import { Client } from 'ssh2';
import { IOError, isRetryableNetworkError, NetworkError } from '@gyomu/core';
import { Effect, Stream } from 'effect';
import { withSftp } from './shared.js';
import { Readable } from 'node:stream';
import { fromReadable } from '../../stream/bridge/nodeStream.js';

export const downloadToStreamUnderNodejs =
  (client: Client) =>
  <R = never>(
    path: string,
  ): Stream.Stream<Uint8Array, IOError | NetworkError, R> =>
    Stream.unwrap(
      withSftp(client)((sftp) =>
        Effect.gen(function* () {
          const stream = yield* Effect.callback<Readable, NetworkError>(
            (resume) => {
              try {
                const rs = sftp.createReadStream(path);

                const onError = (err: Error) => {
                  cleanup();
                  resume(
                    Effect.fail(
                      new NetworkError({
                        cause: err,
                        message: `Failed to create read stream`,
                        operation: 'download' as const,
                        retryable: isRetryableNetworkError(err),
                        endpoint: path,
                      }),
                    ),
                  );
                };

                const onOpen = () => {
                  cleanup();
                  resume(Effect.succeed(rs));
                };

                const cleanup = () => {
                  rs.off('error', onError);
                  rs.off('open', onOpen);
                };

                rs.on('error', onError);
                rs.on('open', onOpen);
              } catch (e) {
                resume(
                  Effect.fail(
                    new NetworkError({
                      message: 'Fail to create read stream',
                      cause: e,
                      operation: 'download' as const,
                      retryable: isRetryableNetworkError(e),
                      endpoint: path,
                    }),
                  ),
                );
              }
            },
          );

          // Node Readable → Effect Stream
          return fromReadable(stream);
        }),
      ),
    );
