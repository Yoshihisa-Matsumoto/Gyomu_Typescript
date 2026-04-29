import { FileTransportInfo } from '../../../gyomu/file/transport.js';
import { Client } from 'basic-ftp';
import {
  IOError,
  isRetryableNetworkError,
  NetworkError,
} from '../../../errors.js';
import { PassThrough } from 'node:stream';
import { Effect, pipe, Stream } from 'effect';
import { fromReadable } from '../../stream/bridge/nodeStream.js';
import { fromPromise } from '@gyomu/shared/effect';
import { NodeStream } from '@effect/platform-node';
import { toEntryPath } from '@gyomu/shared/path';

// ftpClient.ts

export const list =
  (client: Client) =>
  <R = never>(path: string): Effect.Effect<string[], NetworkError, R> => {
    const fullPath = path;

    const fileInfoListPromise = () => client.list(fullPath);
    return pipe(
      fromPromise(NetworkError, (e) => ({
        message: 'Fail to retrieve ftp folders',
        operation: 'request' as const,
        retryable: isRetryableNetworkError(e),
        endpoint: path,
      }))(fileInfoListPromise),
      Effect.map((fileInfoList) => fileInfoList.map((f) => f.name)),
    );
  };

export const getFileInfo =
  (client: Client) =>
  <R = never>(
    path: string,
  ): Effect.Effect<
    {
      size: number;
      date: Date;
    },
    NetworkError,
    R
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
    );
  };

export const uploadFromStream =
  (client: Client) =>
  <R>(
    source: Stream.Stream<Uint8Array, never, R>,
    remotePath: string,
  ): Effect.Effect<void, NetworkError, R> =>
    Effect.gen(function* () {
      // Stream → Node Readable
      const readable = yield* NodeStream.toReadable(source);

      // FTP upload
      yield* fromPromise(NetworkError, (e) => ({
        message: `Failed to upload file to FTP server`,
        operation: 'upload' as const,
        retryable: isRetryableNetworkError(e),
        endpoint: remotePath,
      }))(() => client.uploadFrom(readable, remotePath));
    });

export const downloadToStream =
  (client: Client) =>
  <R = never>(
    path: string,
  ): Stream.Stream<Uint8Array, IOError | NetworkError, R> =>
    Stream.unwrap(
      Effect.gen(function* () {
        const stream = new PassThrough();

        // 非同期で流し込む
        yield* Effect.forkScoped(
          fromPromise(NetworkError, (e) => ({
            message: `Failed to downloadTo`,
            operation: 'download' as const,
            retryable: isRetryableNetworkError(e),
            endpoint: path,
          }))(() => client.downloadTo(stream, path)),
        );

        return fromReadable(stream);
      }),
    );

export const download =
  (client: Client) =>
  <R = never>(
    transportInformation: FileTransportInfo,
  ): Effect.Effect<boolean, NetworkError, R> => {
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
            .then(() => undefined);

    return pipe(
      fromPromise(NetworkError, (e) => ({
        message: 'Fail to do ftp download',
        operation: 'download' as const,
        retryable: isRetryableNetworkError(e),
        endpoint: `from ${transportInformation.sourceFullName} to ${transportInformation.destinationFullName}`,
      }))(promise),
      Effect.map(() => true),
    );
  };
export const upload =
  (client: Client) =>
  <R = never>(
    transportInformation: FileTransportInfo,
  ): Effect.Effect<boolean, NetworkError, R> => {
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
          );

    return pipe(
      fromPromise(NetworkError, (e) => ({
        message: 'Fail to do ftp upload',
        operation: 'upload' as const,
        retryable: isRetryableNetworkError(e),
        endpoint: `from ${transportInformation.sourceFullName} to ${transportInformation.destinationFullName}`,
      }))(promise),
      Effect.map(() => true),
    );
  };
