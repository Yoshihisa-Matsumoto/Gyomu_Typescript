import { Client, ClientChannel, ConnectConfig } from 'ssh2';
import { NetworkError } from '../../../errors.js';
import { Effect } from 'effect';
import { unknownError, AppError } from '@gyomu/shared';

export const connectEffect = (client: Client, config: ConnectConfig) =>
  Effect.callback<undefined, NetworkError>((resume) => {
    const onReady = () => {
      cleanup();
      resume(Effect.succeed(undefined));
    };

    const onError = (err: Error) => {
      cleanup();
      resume(
        Effect.fail(
          unknownError(NetworkError, err, 'Failed to connect to SFTP server'),
        ),
      );
    };

    const cleanup = () => {
      client.off('ready', onReady);
      client.off('error', onError);
    };

    client.on('ready', onReady);
    client.on('error', onError);

    client.connect(config);

    // 中断時の処理（重要）
    return Effect.sync(() => {
      cleanup();
      client.end();
    });
  });

// const withSsh =
//   (client: Client) =>
//   <A, E, R = never>(
//     f: (ssh: SSHWra) => Effect.Effect<A, E, R>,
//   ): Effect.Effect<A, E | NetworkError, R> =>
//     Effect.callback((resume) => {
//       client.exec((err, sftp) => {
//         if (err || !sftp) {
//           resume(
//             Effect.fail(
//               unknownError(NetworkError, err, 'Failed to create SFTP session'),
//             ),
//           );
//           return;
//         }

//         // f(sftp) を実行して結果をそのまま流す
//         resume(f(sftp));
//       });
//     });

export const execute =
  (client: Client) =>
  <E extends AppError, R = never>(
    command: string,
    options: {
      requireShell?: boolean;
      workingDirectory?: string;
      noTrimOutput?: boolean;
    },
  ): Effect.Effect<
    {
      exitCode: number | null;
      result: string;
      error: string;
    },
    E | NetworkError,
    R
  > =>
    Effect.callback((resume) => {
      const cmd = options?.workingDirectory
        ? `cd ${options.workingDirectory} && ${command}`
        : command;

      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];

      const onError = (err: Error) => {
        resume(
          Effect.fail(
            unknownError(NetworkError, err, 'Failed to execute SSH command'),
          ),
        );
      };

      const handleStream = (stream: ClientChannel) => {
        let exitCode: number | null = null;

        stream.on('data', (data: Buffer) => {
          stdout.push(data);
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr.push(data);
        });

        stream.on('exit', (code: number) => {
          exitCode = code;
        });

        stream.on('close', () => {
          const result = Buffer.concat(stdout).toString();
          const error = Buffer.concat(stderr).toString();

          resume(
            Effect.succeed({
              exitCode,
              result: options?.noTrimOutput ? result : result.trim(),
              error: options?.noTrimOutput ? error : error.trim(),
            }),
          );
        });

        stream.on('error', onError);
      };

      if (options?.requireShell) {
        client.shell((err, stream) => {
          if (err) return onError(err);
          handleStream(stream);

          stream.end(cmd + '\n');
        });
      } else {
        client.exec(cmd, (err, stream) => {
          if (err) return onError(err);
          handleStream(stream);
        });
      }
    });
