import { PassThrough } from 'node:stream'
import { NetworkError, isRetryableNetworkError } from '@gyomu/schema'
import { Effect, Stream, pipe } from 'effect'
import { NodeStream } from '@effect/platform-node'
import { toEntryPath } from '@gyomu/schema/shared/fs'
import { fromPromise } from '@gyomu/schema/effect'
import { fromReadable } from '../../stream/bridge/nodeStream.js'
import type { IOError } from '@gyomu/schema'
import type { Client } from 'basic-ftp'
import type { FileTransportInfo } from '@gyomu/schema/gyomu/file'

// ftpClient.ts

export const list =
  (client: Client) =>
  (path: string): Effect.Effect<Array<string>, NetworkError> => {
    const fullPath = path

    const fileInfoListPromise = () => client.list(fullPath)
    return pipe(
      fromPromise(NetworkError, (e) => ({
        message: 'Fail to retrieve ftp folders',
        operation: 'request' as const,
        retryable: isRetryableNetworkError(e),
        endpoint: path,
      }))(fileInfoListPromise),
      Effect.map((fileInfoList) => fileInfoList.map((f) => f.name)),
    )
  }

export const getFileInfo =
  (client: Client) =>
  (
    path: string,
  ): Effect.Effect<
    {
      size: number
      date: Date
    },
    NetworkError
  > => {
    return pipe(
      Effect.all([
        fromPromise(NetworkError, (e) => ({
          message: 'Fail to get size',
          operation: 'request' as const,
          retryable: isRetryableNetworkError(e),
          endpoint: path,
        }))(() => client.size(path)),
        fromPromise(NetworkError, (e) => ({
          message: 'Fail to get lastMod',
          operation: 'request' as const,
          retryable: isRetryableNetworkError(e),
          endpoint: path,
        }))(() => client.lastMod(path)),
      ]),
      Effect.map(([size, date]) => ({ size, date })),
    )
  }

export const uploadFromStream =
  (client: Client) =>
  (
    source: Stream.Stream<Uint8Array, IOError>,
    remotePath: string,
  ): Effect.Effect<void, NetworkError> =>
    Effect.gen(function* () {
      // Stream → Node Readable
      const readable = yield* NodeStream.toReadable(source)

      // FTP upload
      yield* fromPromise(NetworkError, (e) => ({
        message: `Failed to upload file to FTP server`,
        operation: 'upload' as const,
        retryable: isRetryableNetworkError(e),
        endpoint: remotePath,
      }))(() => client.uploadFrom(readable, remotePath))
    })

export const downloadToStream =
  (client: Client) =>
  (path: string): Stream.Stream<Uint8Array, IOError | NetworkError> =>
    Stream.unwrap(
      Effect.gen(function* () {
        const stream = new PassThrough()

        // 非同期で流し込む
        yield* Effect.forkScoped(
          fromPromise(NetworkError, (e) => ({
            message: `Failed to downloadTo`,
            operation: 'download' as const,
            retryable: isRetryableNetworkError(e),
            endpoint: path,
          }))(() => client.downloadTo(stream, path)),
        )

        return fromReadable(stream)
      }),
    )

export const download =
  (client: Client) =>
  (transportInformation: FileTransportInfo): Effect.Effect<boolean, NetworkError> => {
    const promise = transportInformation.isSourceDirectory
      ? () =>
          client.downloadToDir(
            transportInformation.destinationPath,
            toEntryPath(transportInformation.sourceFolderName),
          )
      : () =>
          client
            .downloadTo(
              transportInformation.destinationFullName,
              toEntryPath(transportInformation.sourceFullName),
            )
            .then(() => undefined)

    return pipe(
      fromPromise(NetworkError, (e) => ({
        message: 'Fail to do ftp download',
        operation: 'download' as const,
        retryable: isRetryableNetworkError(e),
        endpoint: `from ${transportInformation.sourceFullName} to ${transportInformation.destinationFullName}`,
      }))(promise),
      Effect.map(() => true),
    )
  }
export const upload =
  (client: Client) =>
  (transportInformation: FileTransportInfo): Effect.Effect<boolean, NetworkError> => {
    const promise = !transportInformation.isSourceDirectory
      ? () =>
          client
            .uploadFrom(
              transportInformation.sourceFullName,
              toEntryPath(transportInformation.destinationFullName),
            )
            .then(() => undefined)
      : () =>
          client.uploadFromDir(
            transportInformation.sourceFullName,
            toEntryPath(transportInformation.destinationFullName),
          )

    return pipe(
      fromPromise(NetworkError, (e) => ({
        message: 'Fail to do ftp upload',
        operation: 'upload' as const,
        retryable: isRetryableNetworkError(e),
        endpoint: `from ${transportInformation.sourceFullName} to ${transportInformation.destinationFullName}`,
      }))(promise),
      Effect.map(() => true),
    )
  }
