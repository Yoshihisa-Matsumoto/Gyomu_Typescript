import { Client, SFTPWrapper } from 'ssh2';
import { isRetryableNetworkError, NetworkError } from '@gyomu/core';
import { Effect } from 'effect';
import { wrapInfraError } from '@gyomu/shared';

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
              wrapInfraError(NetworkError, err, (e) => ({
                message: 'Fail to create to SFTP session',
                operation: 'connect' as const,
                retryable: isRetryableNetworkError(e),
                endpoint: `${JSON.stringify(sftp)}`,
              })),
            ),
          );
          return;
        }

        // f(sftp) を実行して結果をそのまま流す
        resume(f(sftp));
      });
    });
