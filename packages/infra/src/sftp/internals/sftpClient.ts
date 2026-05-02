import { Client, ConnectConfig, FileEntryWithStats, SFTPWrapper } from 'ssh2';
import { IOError, isRetryableNetworkError, NetworkError } from '@gyomu/core';
import { Effect, Stream } from 'effect';
import { wrapInfraError } from '@gyomu/shared';
import { FileTransportInfo } from '@gyomu/core/gyomu/file';
import { toEntryPath } from '@gyomu/shared/path';
import { FileSystem } from 'effect';
import { makeDirectory, readDirectoryDetailed } from '../../fs/fs-utils.js';
import { uploadFromStreamUnderNodejs } from './upload.node.js';
import { withSftp } from './shared.js';
import { downloadToStreamUnderNodejs } from './download.node.js';

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
          wrapInfraError(NetworkError, err, (e) => ({
            message: 'Fail to connect to SFTP server',
            operation: 'connect' as const,
            retryable: isRetryableNetworkError(e),
            endpoint: `host: ${config.host} port: ${config.port} user: ${config.username}`,
          })),
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

export const listInternal = (sftp: SFTPWrapper, remoteDir: string) =>
  Effect.callback<FileEntryWithStats[], NetworkError>((resume) => {
    sftp.readdir(remoteDir, (err, list) => {
      if (err || !list) {
        resume(
          Effect.fail(
            wrapInfraError(NetworkError, err, (e) => ({
              message: 'Fail to read directory',
              operation: 'request' as const,
              retryable: isRetryableNetworkError(e),
              endpoint: remoteDir,
            })),
          ),
        );
        return;
      }
      resume(Effect.succeed(list));
    });
  });
export const list =
  (client: Client) =>
  <R = never>(path: string): Effect.Effect<string[], NetworkError, R> =>
    withSftp(client)((sftp) =>
      listInternal(sftp, path).pipe(
        Effect.map((fileInfoList) => fileInfoList.map((f) => f.filename)),
      ),
    );

export const getFileInfo =
  (client: Client) =>
  <R = never>(
    path: string,
  ): Effect.Effect<
    {
      isFile: boolean;
      size: number;
      date: Date;
    },
    NetworkError,
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
                wrapInfraError(NetworkError, err, (e) => ({
                  message: 'Fail toget file info from SFTP',
                  operation: 'request' as const,
                  retryable: isRetryableNetworkError(e),
                  endpoint: path,
                })),
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
            wrapInfraError(NetworkError, err, (e) => ({
              message: 'Fail to download file',
              operation: 'download' as const,
              retryable: isRetryableNetworkError(e),
              endpoint: remote,
            })),
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
  ): Effect.Effect<void, IOError | NetworkError, FileSystem.FileSystem> =>
    Effect.gen(function* () {
      // ローカルディレクトリ作成
      // yield* fromSync(
      //   IOError,
      //   'Failed to create local directory',
      // )(() => fs.makeDirectory(localDir, { recursive: true }));
      yield* makeDirectory(localDir);

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
  ): Effect.Effect<boolean, IOError | NetworkError, FileSystem.FileSystem> =>
    withSftp(client)((sftp) =>
      Effect.gen(function* () {
        if (transportInformation.isSourceDirectory) {
          const remoteDir = toEntryPath(transportInformation.sourceFolderName);

          yield* downloadDir(sftp)(
            remoteDir,
            transportInformation.destinationPath,
          );
        } else {
          const remoteFile = toEntryPath(transportInformation.sourceFullName);

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
  <R = never>(
    path: string,
  ): Stream.Stream<Uint8Array, IOError | NetworkError, R> =>
    downloadToStreamUnderNodejs(client)(path);

const uploadFile = (sftp: SFTPWrapper) => (local: string, remote: string) =>
  Effect.callback<void, NetworkError>((resume) => {
    sftp.fastPut(local, remote, (err) => {
      if (err) {
        resume(
          Effect.fail(
            wrapInfraError(NetworkError, err, (e) => ({
              message: 'Fail to upload file',
              operation: 'upload' as const,
              retryable: isRetryableNetworkError(e),
              endpoint: `${local} -> ${remote}`,
            })),
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
                      wrapInfraError(NetworkError, err, (e) => ({
                        message: 'Fail to mkdir',
                        operation: 'request' as const,
                        retryable: isRetryableNetworkError(e),
                        endpoint: current,
                      })),
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
  (
    localDir: string,
    remoteDir: string,
  ): Effect.Effect<void, IOError | NetworkError, FileSystem.FileSystem> =>
    Effect.gen(function* () {
      yield* mkdirRecursive(sftp)(remoteDir);

      const entries = yield* readDirectoryDetailed(localDir).pipe(
        Effect.mapError((e) =>
          wrapInfraError(IOError, e, () => ({
            message: 'Fail to read local directory',
            layer: 'filesystem' as const,
            target: localDir,
            operation: 'read' as const,
          })),
        ),
      );
      // const entries = yield* fromPromise(
      //   NetworkError,
      //   'Failed to read local directory',
      // )(() => fs.readdir(localDir, { withFileTypes: true }));

      yield* Effect.forEach(entries, (entry) => {
        const localPath = `${localDir}/${entry.name}`;
        const remotePath = `${remoteDir}/${entry.name}`;

        if (entry.type == 'Directory') {
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
  ): Effect.Effect<boolean, IOError | NetworkError, FileSystem.FileSystem> =>
    withSftp(client)((sftp) =>
      Effect.gen(function* () {
        const remoteBase = toEntryPath(
          transportInformation.destinationFullName,
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
  <R>(
    source: Stream.Stream<Uint8Array, IOError, R>,
    remotePath: string,
  ): Effect.Effect<void, NetworkError, R> =>
    uploadFromStreamUnderNodejs(client)(source, remotePath);
