import { Client, SFTPWrapper } from 'ssh2';
import { NetworkError, unknownError } from '../../../errors.js';
import { Effect } from 'effect';

export const withSftp =
  (client: Client) =>
  <A, E, R = never>(
    f: (sftp: SFTPWrapper) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | NetworkError, R> =>
    Effect.callback((resume) => {
      client.sftp((err, sftp) => {
        if (err || !sftp) {
          resume(
            Effect.fail(
              unknownError(NetworkError, err, 'Failed to create SFTP session'),
            ),
          );
          return;
        }

        // f(sftp) を実行して結果をそのまま流す
        resume(f(sftp));
      });
    });
