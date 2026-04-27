import { Client } from 'ssh2';
import { IOError, NetworkError } from '../../../errors.js';
import { Effect, Stream } from 'effect';
import { AppError } from '../../../base-error.js';
import { withSftp } from './shared.js';
import { Readable } from 'node:stream';
import { fromReadable } from '../../stream/bridge/nodeStream.js';

export const downloadToStreamUnderNodejs =
  (client: Client) =>
  <E extends AppError, R = never>(
    path: string,
  ): Stream.Stream<Uint8Array, E | IOError | NetworkError, R> =>
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
                      new NetworkError(
                        `Failed to create read stream: ${err.message}`,
                      ),
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
                    new NetworkError(
                      `Failed to create read stream: ${String(e)}`,
                    ),
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
