import { Client, ConnectConfig, FileEntryWithStats, SFTPWrapper } from 'ssh2';
import { IOError, NetworkError, unknownError } from '../../../../errors.js';
import { Effect, Stream } from 'effect';
import { AppError } from '../../../../base-error.js';
import { fromPromise, fromSync } from '../../../../shared/effect.ts/core.js';
import { platform } from '../../../../platform/index.js';
import { FileTransportInfo } from '../../../../fileModel.js';
import { fromReadable } from '../../stream/nodeStream.js';
import { Readable, Writable } from 'node:stream';
import { NodeStream } from '@effect/platform-node';

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

const withSftp =
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

export const listInternal = (sftp: SFTPWrapper, remoteDir: string) =>
  Effect.callback<FileEntryWithStats[], NetworkError>((resume) => {
    sftp.readdir(remoteDir, (err, list) => {
      if (err || !list) {
        resume(
          Effect.fail(
            unknownError(NetworkError, err, 'Failed to read directory'),
          ),
        );
        return;
      }
      resume(Effect.succeed(list));
    });
  });
export const list =
  (client: Client) =>
  <E extends AppError, R = never>(
    path: string,
  ): Effect.Effect<string[], E | NetworkError, R> =>
    withSftp(client)((sftp) =>
      listInternal(sftp, path).pipe(
        Effect.map((fileInfoList) => fileInfoList.map((f) => f.filename)),
      ),
    );

export const getFileInfo =
  (client: Client) =>
  <E extends AppError, R = never>(
    path: string,
  ): Effect.Effect<
    {
      isFile: boolean;
      size: number;
      date: Date;
    },
    E | NetworkError,
    R
  > =>
    withSftp(client)((sftp) =>
      Effect.callback<
        {
          isFile: boolean;
          size: number;
          date: Date;
        },
        NetworkError
      >((resume) => {
        sftp.stat(path, (err, stats) => {
          if (err || !stats) {
            resume(
              Effect.fail(
                unknownError(
                  NetworkError,
                  err,
                  'Failed to get file info from SFTP',
                ),
              ),
            );
            return;
          }

          resume(
            Effect.succeed({
              size: stats.size,
              date: new Date(stats.mtime * 1000),
              isFile: stats.isFile(),
            }),
          );
        });
      }),
    );

const downloadFile = (sftp: SFTPWrapper) => (remote: string, local: string) =>
  Effect.callback<void, NetworkError>((resume) => {
    sftp.fastGet(remote, local, (err) => {
      if (err) {
        resume(
          Effect.fail(
            unknownError(
              NetworkError,
              err,
              `Failed to download file: ${remote}`,
            ),
          ),
        );
        return;
      }
      resume(Effect.succeed(undefined));
    });
  });

const downloadDir =
  (sftp: SFTPWrapper) =>
  (
    remoteDir: string,
    localDir: string,
  ): Effect.Effect<void, IOError | NetworkError> =>
    Effect.gen(function* () {
      // ローカルディレクトリ作成
      yield* fromSync(
        IOError,
        'Failed to create local directory',
      )(() => platform.mkdirSync(localDir, { recursive: true }));

      const list = yield* listInternal(sftp, remoteDir);

      yield* Effect.forEach(list, (item) => {
        const remotePath = `${remoteDir}/${item.filename}`;
        const localPath = `${localDir}/${item.filename}`;
        //console.log(`Downloading ${JSON.stringify(item)} `);
        //if (item.longname.startsWith('d')) {
        if (item.attrs && item.attrs.isDirectory()) {
          // ディレクトリ
          return downloadDir(sftp)(remotePath, localPath);
        } else {
          // ファイル
          return downloadFile(sftp)(remotePath, localPath);
        }
      });
    });

export const download =
  (client: Client) =>
  (
    transportInformation: FileTransportInfo,
  ): Effect.Effect<boolean, IOError | NetworkError> =>
    withSftp(client)((sftp) =>
      Effect.gen(function* () {
        if (transportInformation.isSourceDirectory) {
          const remoteDir = transportInformation.sourceFolderName.replace(
            platform.sep,
            '/',
          );

          yield* downloadDir(sftp)(
            remoteDir,
            transportInformation.destinationPath,
          );
        } else {
          const remoteFile = transportInformation.sourceFullName.replace(
            platform.sep,
            '/',
          );

          yield* downloadFile(sftp)(
            remoteFile,
            transportInformation.destinationFullName,
          );
        }

        return true;
      }),
    );

export const downloadToStream =
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

const uploadFile = (sftp: SFTPWrapper) => (local: string, remote: string) =>
  Effect.callback<void, NetworkError>((resume) => {
    sftp.fastPut(local, remote, (err) => {
      if (err) {
        resume(
          Effect.fail(
            unknownError(NetworkError, err, `Failed to upload file: ${local}`),
          ),
        );
        return;
      }
      resume(Effect.succeed(undefined));
    });
  });
const mkdirRecursive =
  (sftp: SFTPWrapper) =>
  (remoteDir: string): Effect.Effect<void, NetworkError> =>
    Effect.gen(function* () {
      const parts = remoteDir.split('/').filter(Boolean);

      let current = remoteDir.startsWith('/') ? '/' : '';

      for (const part of parts) {
        current = current === '/' ? `/${part}` : `${current}/${part}`;

        yield* Effect.callback<void, NetworkError>((resume) => {
          sftp.mkdir(current, (err) => {
            // 既に存在する場合は無視
            if (err) {
              // ssh2はエラーコードが安定しないので statで確認する方が安全
              sftp.stat(current, (statErr, stats) => {
                if (statErr || !stats) {
                  resume(
                    Effect.fail(
                      unknownError(
                        NetworkError,
                        err,
                        `Failed to mkdir: ${current}`,
                      ),
                    ),
                  );
                } else {
                  // 既に存在 → OK
                  resume(Effect.succeed(undefined));
                }
              });
              return;
            }

            resume(Effect.succeed(undefined));
          });
        });
      }
    });

const uploadDir =
  (sftp: SFTPWrapper) =>
  (localDir: string, remoteDir: string): Effect.Effect<void, NetworkError> =>
    Effect.gen(function* () {
      yield* mkdirRecursive(sftp)(remoteDir);

      const entries = yield* fromPromise(
        NetworkError,
        'Failed to read local directory',
      )(() => platform.readdir(localDir, { withFileTypes: true }));

      yield* Effect.forEach(entries, (entry) => {
        const localPath = `${localDir}/${entry.name}`;
        const remotePath = `${remoteDir}/${entry.name}`;

        if (entry.isDirectory()) {
          return uploadDir(sftp)(localPath, remotePath);
        } else {
          return uploadFile(sftp)(localPath, remotePath);
        }
      });
    });

export const upload =
  (client: Client) =>
  (
    transportInformation: FileTransportInfo,
  ): Effect.Effect<boolean, NetworkError> =>
    withSftp(client)((sftp) =>
      Effect.gen(function* () {
        const remoteBase = transportInformation.destinationFullName.replace(
          platform.sep,
          '/',
        );

        if (transportInformation.isSourceDirectory) {
          yield* uploadDir(sftp)(
            transportInformation.sourceFullName,
            remoteBase,
          );
        } else {
          yield* uploadFile(sftp)(
            transportInformation.sourceFullName,
            remoteBase,
          );
        }

        return true;
      }),
    );

export const uploadFromStream =
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
