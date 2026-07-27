import {
  FullPath,
  IOError,
  NetworkError,
  isRetryableNetworkError,
  wrapInfraError,
} from '@gyomu/schema'
import { Effect } from 'effect'
import { toEntryPath } from '@gyomu/schema/shared/fs'
import { makeDirectory, readDirectoryDetailed } from '../../fs/fs-utils.js'
import { uploadFromStreamUnderNodejs } from './upload.node.js'
import { withSftp } from './shared.js'
import { downloadToStreamUnderNodejs } from './download.node.js'
import type { FileTransportInfo } from '@gyomu/schema/gyomu/file'
import type { FileSystem, Stream } from 'effect'
import type { Client, ConnectConfig, FileEntryWithStats, SFTPWrapper } from 'ssh2'

/**
 * Connects to the SFTP server using the provided configuration.
 *
 * @param client The SSH2 client instance.
 *
 * @param config The connection configuration settings.
 *
 * @returns An effect that completes when the connection is established or fails with a NetworkError.
 */
export const connectEffect = (client: Client, config: ConnectConfig) =>
  Effect.callback<undefined, NetworkError>((resume) => {
    const onReady = () => {
      cleanup()
      resume(Effect.succeed(undefined))
    }

    const onError = (err: Error) => {
      cleanup()
      resume(
        Effect.fail(
          wrapInfraError(NetworkError, err, (e) => ({
            message: 'Fail to connect to SFTP server',
            operation: 'connect' as const,
            retryable: isRetryableNetworkError(e),
            endpoint: `host: ${config.host} port: ${config.port} user: ${config.username}`,
          })),
        ),
      )
    }

    const cleanup = () => {
      client.off('ready', onReady)
      client.off('error', onError)
    }

    client.on('ready', onReady)
    client.on('error', onError)

    client.connect(config)

    // 中断時の処理（重要）
    return Effect.sync(() => {
      cleanup()
      client.end()
    })
  })

/**
 * Lists the entries in a remote SFTP directory.
 *
 * @param sftp The SFTP client wrapper.
 *
 * @param remoteDir The remote directory path to list.
 *
 * @returns An Effect containing the list of file entries.
 */
export const listInternal = (sftp: SFTPWrapper, remoteDir: string) =>
  Effect.callback<Array<FileEntryWithStats>, NetworkError>((resume) => {
    sftp.readdir(remoteDir, (err, list) => {
      if (err) {
        resume(
          Effect.fail(
            wrapInfraError(NetworkError, err, (e) => ({
              message: 'Fail to read directory',
              operation: 'request' as const,
              retryable: isRetryableNetworkError(e),
              endpoint: remoteDir,
            })),
          ),
        )
        return
      }
      resume(Effect.succeed(list))
    })
  })

/**
 * Retrieves a list of file names from the specified remote directory.
 *
 * @param client The SSH2 client instance.
 *
 * @param path The remote directory path to list.
 *
 * @returns An effect resolving to an array of file names.
 */
export const list =
  (client: Client) =>
  (path: string): Effect.Effect<Array<string>, NetworkError> =>
    withSftp(client)((sftp) =>
      listInternal(sftp, path).pipe(
        Effect.map((fileInfoList) => fileInfoList.map((f) => f.filename)),
      ),
    )

/**
 * Retrieves file metadata (type, size, and modification date) for a given remote path.
 *
 * @param client The SSH2 client instance.
 *
 * @param path The remote file path.
 *
 * @returns An effect resolving to file status information.
 */
export const getFileInfo =
  (client: Client) =>
  (
    path: string,
  ): Effect.Effect<
    {
      isFile: boolean
      size: number
      date: Date
    },
    NetworkError
  > =>
    withSftp(client)((sftp) =>
      Effect.callback<
        {
          isFile: boolean
          size: number
          date: Date
        },
        NetworkError
      >((resume) => {
        sftp.stat(path, (err, stats) => {
          if (err) {
            resume(
              Effect.fail(
                wrapInfraError(NetworkError, err, (e) => ({
                  message: 'Fail toget file info from SFTP',
                  operation: 'request' as const,
                  retryable: isRetryableNetworkError(e),
                  endpoint: path,
                })),
              ),
            )
            return
          }

          resume(
            Effect.succeed({
              size: stats.size,
              date: new Date(stats.mtime * 1000),
              isFile: stats.isFile(),
            }),
          )
        })
      }),
    )

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
        )
        return
      }
      resume(Effect.succeed(undefined))
    })
  })

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
      yield* makeDirectory(localDir)

      const listFileInformations = yield* listInternal(sftp, remoteDir)

      yield* Effect.forEach(listFileInformations, (item) => {
        const remotePath = `${remoteDir}/${item.filename}`
        const localPath = `${localDir}/${item.filename}`
        console.log(`Downloading`, item)
        // if (item.longname.startsWith('d')) {
        if (item.attrs.isDirectory()) {
          // ディレクトリ
          return downloadDir(sftp)(remotePath, localPath)
        } else {
          // ファイル
          return downloadFile(sftp)(remotePath, localPath)
        }
      })
    })

/**
 * Downloads a file or directory from the SFTP server based on the provided transport information.
 *
 * @param client The SSH/SFTP client instance.
 *
 * @param transportInformation Configuration containing source and destination paths.
 *
 * @returns An Effect that completes with true if the download is successful, or fails with IOError or NetworkError.
 */
export const download =
  (client: Client) =>
  (
    transportInformation: FileTransportInfo,
  ): Effect.Effect<boolean, IOError | NetworkError, FileSystem.FileSystem> =>
    withSftp(client)((sftp) =>
      Effect.gen(function* () {
        if (transportInformation.isSourceDirectory) {
          const remoteDir = toEntryPath(transportInformation.sourceFolderName)

          yield* downloadDir(sftp)(remoteDir, transportInformation.destinationPath)
        } else {
          const remoteFile = toEntryPath(transportInformation.sourceFullName)

          yield* downloadFile(sftp)(remoteFile, transportInformation.destinationFullName)
        }

        return true
      }),
    )

/**
 * Downloads a remote file as a stream of byte arrays.
 *
 * @param client The SSH/SFTP client instance.
 *
 * @param path The remote file path.
 *
 * @returns A Stream emitting file content as Uint8Array, or failing with IOError or NetworkError.
 */
export const downloadToStream =
  (client: Client) =>
  (path: string): Stream.Stream<Uint8Array, IOError | NetworkError> =>
    downloadToStreamUnderNodejs(client)(path)

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
        )
        return
      }
      resume(Effect.succeed(undefined))
    })
  })
const mkdirRecursive =
  (sftp: SFTPWrapper) =>
  (remoteDir: string): Effect.Effect<void, NetworkError> =>
    Effect.gen(function* () {
      const parts = remoteDir.split('/').filter(Boolean)

      let current = remoteDir.startsWith('/') ? '/' : ''

      for (const part of parts) {
        current = current === '/' ? `/${part}` : `${current}/${part}`

        yield* Effect.callback<void, NetworkError>((resume) => {
          sftp.mkdir(current, (err) => {
            // 既に存在する場合は無視
            if (err) {
              // ssh2はエラーコードが安定しないので statで確認する方が安全
              sftp.stat(current, (statErr) => {
                if (statErr) {
                  resume(
                    Effect.fail(
                      wrapInfraError(NetworkError, err, (e) => ({
                        message: 'Fail to mkdir',
                        operation: 'request' as const,
                        retryable: isRetryableNetworkError(e),
                        endpoint: current,
                      })),
                    ),
                  )
                } else {
                  // 既に存在 → OK
                  resume(Effect.succeed(undefined))
                }
              })
              return
            }

            resume(Effect.succeed(undefined))
          })
        })
      }
    })

const uploadDir =
  (sftp: SFTPWrapper) =>
  (
    localDir: FullPath,
    remoteDir: string,
  ): Effect.Effect<void, IOError | NetworkError, FileSystem.FileSystem> =>
    Effect.gen(function* () {
      yield* mkdirRecursive(sftp)(remoteDir)

      const entries = yield* readDirectoryDetailed(localDir).pipe(
        Effect.mapError((e) =>
          wrapInfraError(IOError, e, () => ({
            message: 'Fail to read local directory',
            layer: 'filesystem' as const,
            target: localDir,
            operation: 'read' as const,
          })),
        ),
      )
      // const entries = yield* fromPromise(
      //   NetworkError,
      //   'Failed to read local directory',
      // )(() => fs.readdir(localDir, { withFileTypes: true }));

      yield* Effect.forEach(entries, (entry) => {
        const localPath = FullPath(`${localDir}/${entry.name}`)
        const remotePath = `${remoteDir}/${entry.name}`

        if (entry.type == 'Directory') {
          return uploadDir(sftp)(localPath, remotePath)
        } else {
          return uploadFile(sftp)(localPath, remotePath)
        }
      })
    })

/**
 * Uploads a file or directory to the SFTP server based on the provided transport information.
 *
 * @param client The SSH/SFTP client instance.
 *
 * @param transportInformation Configuration containing source and destination paths.
 *
 * @returns An Effect that completes with true if the upload is successful, or fails with IOError or NetworkError.
 */
export const upload =
  (client: Client) =>
  (
    transportInformation: FileTransportInfo,
  ): Effect.Effect<boolean, IOError | NetworkError, FileSystem.FileSystem> =>
    withSftp(client)((sftp) =>
      Effect.gen(function* () {
        const remoteBase = toEntryPath(transportInformation.destinationFullName)

        if (transportInformation.isSourceDirectory) {
          yield* uploadDir(sftp)(transportInformation.sourceFullName, remoteBase)
        } else {
          yield* uploadFile(sftp)(transportInformation.sourceFullName, remoteBase)
        }

        return true
      }),
    )

/**
 * Uploads data from a stream to a remote file path.
 *
 * @param client The SSH/SFTP client instance.
 *
 * @param source The source stream of data.
 *
 * @param remotePath The destination remote path.
 *
 * @returns An Effect that completes when the upload is finished, or fails with a NetworkError.
 */
export const uploadFromStream =
  (client: Client) =>
  (
    source: Stream.Stream<Uint8Array, IOError>,
    remotePath: string,
  ): Effect.Effect<void, NetworkError> =>
    uploadFromStreamUnderNodejs(client)(source, remotePath)
