import { FileTransportInfo } from '../../../../fileModel.js';
import { Client } from 'basic-ftp';
import { IOError, NetworkError } from '../../../../errors.js';
import { AppError } from '../../../../base-error.js';
import { PassThrough } from 'node:stream';
import { Effect, pipe, Stream } from 'effect';
import { fromReadableControlled } from '../../../nodeStream.js';
import { fromPromise } from '../../../index.js';
import { NodeStream } from '@effect/platform-node';
import { platform } from '../../../../platform/index.js';

// ftpClient.ts
export interface FtpClient {
  download: (path: string) => Stream.Stream<Uint8Array>;
  list: (path: string) => Effect.Effect<string[]>;
  getFileInfo(transportInformation: FileTransportInfo): Effect.Effect<{
    size: number;
    date: Date;
  }>;
  upload(transportInformation: FileTransportInfo): Effect.Effect<void>;
}

export const list =
  (client: Client) =>
  <E extends AppError, R = never>(
    path: string,
  ): Effect.Effect<string[], E | NetworkError, R> => {
    const fullPath = path;

    const fileInfoListPromise = () => client.list(fullPath);
    return pipe(
      fromPromise(
        NetworkError,
        'Fail to retrieve ftp folders',
      )(fileInfoListPromise),
      Effect.map((fileInfoList) => fileInfoList.map((f) => f.name)),
    );
  };

export const getFileInfo =
  (client: Client) =>
  <E extends AppError, R = never>(
    path: string,
  ): Effect.Effect<
    {
      size: number;
      date: Date;
    },
    E | NetworkError,
    R
  > => {
    return pipe(
      Effect.all([
        fromPromise(NetworkError, 'Fail to get size')(() => client.size(path)),
        fromPromise(
          NetworkError,
          'Fail to get lastMod',
        )(() => client.lastMod(path)),
      ]),
      Effect.map(([size, date]) => ({ size, date })),
    );
  };

export const uploadFromStream =
  (client: Client) =>
  <E extends AppError, R>(
    source: Stream.Stream<Uint8Array, E, R>,
    remotePath: string,
  ): Effect.Effect<void, E | NetworkError, R> =>
    Effect.gen(function* () {
      // Stream → Node Readable
      const readable = yield* NodeStream.toReadable(source);

      // FTP upload
      yield* fromPromise(
        NetworkError,
        `Failed to upload file to FTP server: ${remotePath}`,
      )(() => client.uploadFrom(readable, remotePath));
    });

export const downloadToStream =
  (client: Client) =>
  <E extends AppError, R = never>(
    path: string,
  ): Stream.Stream<Uint8Array, E | IOError | NetworkError, R> =>
    Stream.unwrap(
      Effect.gen(function* () {
        const stream = new PassThrough();

        // 非同期で流し込む
        yield* Effect.forkScoped(
          Effect.tryPromise({
            try: () => client.downloadTo(stream, path),
            catch: (e) => new NetworkError(String(e)),
          }),
        );

        return fromReadableControlled(stream);
      }),
    );

export const download =
  (client: Client) =>
  <E extends AppError, R = never>(
    transportInformation: FileTransportInfo,
  ): Effect.Effect<boolean, E | NetworkError, R> => {
    const promise = transportInformation.isSourceDirectory
      ? () =>
          client.downloadToDir(
            transportInformation.destinationPath,
            transportInformation.sourceFolderName.replace(platform.sep, '/'),
          )
      : () =>
          client
            .downloadTo(
              transportInformation.destinationFullName,
              transportInformation.sourceFullName.replace(platform.sep, '/'),
            )
            .then(() => undefined);

    return pipe(
      fromPromise(NetworkError, 'Fail to do ftp download')(promise),
      Effect.map(() => true),
    );
  };
export const upload =
  (client: Client) =>
  <E extends AppError, R = never>(
    transportInformation: FileTransportInfo,
  ): Effect.Effect<boolean, E | NetworkError, R> => {
    const promise = !transportInformation.isSourceDirectory
      ? () =>
          client
            .uploadFrom(
              transportInformation.sourceFullName,
              transportInformation.destinationFullName.replace(
                platform.sep,
                '/',
              ),
            )
            .then(() => undefined)
      : () =>
          client.uploadFromDir(
            transportInformation.sourceFullName,
            transportInformation.destinationFullName.replace(platform.sep, '/'),
          );

    return pipe(
      fromPromise(NetworkError, 'Fail to do ftp upload')(promise),
      Effect.map(() => true),
    );
  };
