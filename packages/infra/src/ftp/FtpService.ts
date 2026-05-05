import { Effect, Layer, Context, Redacted, Config, FileSystem } from 'effect';
import { Client } from 'basic-ftp';
import { withDefault } from 'effect/Config';
import {
  NetworkError,
  ConfigError,
  isRetryableNetworkError,
  IOError,
} from '@gyomu/core';
import { ConfigProviderLive, ConfigService } from '../config.js';
import { fromPromise } from '@gyomu/shared/effect';
import { Scope } from 'effect/Scope';
import { FileTransportInfo } from '@gyomu/core/gyomu/file';
import { Stream } from 'effect/Stream';
import {
  download,
  downloadToStream,
  getFileInfo,
  list,
  upload,
  uploadFromStream,
} from './internals/ftpClient.js';

//type FtpConfig = Config.Success<typeof ftpConfigRaw>;

export class FtpService extends Context.Service<
  FtpService,
  {
    withConnection: <A, R = never>(
      prefix: string,
      f: (ftp: {
        download: (
          transportInformation: FileTransportInfo,
        ) => Effect.Effect<boolean, NetworkError, R>;
        downloadToStream: (
          path: string,
        ) => Stream<Uint8Array, IOError | NetworkError, R>;
        list: (path: string) => Effect.Effect<string[], NetworkError, R>;
        getFileInfo(path: string): Effect.Effect<
          {
            size: number;
            date: Date;
          },
          NetworkError,
          R
        >;
        upload: (
          transportInformation: FileTransportInfo,
        ) => Effect.Effect<void, NetworkError, R>;
        uploadFromStream(
          source: Stream<Uint8Array, NetworkError, R>,
          remotePath: string,
        ): Effect.Effect<void, NetworkError, R>;
      }) => Effect.Effect<A, NetworkError | IOError | ConfigError, R>,
    ) => Effect.Effect<
      A,
      NetworkError | IOError | ConfigError,
      R | Scope | FileSystem.FileSystem
    >;
  }
>()('FtpService', {
  make: Effect.gen(function* () {
    const configService = yield* ConfigService;

    return {
      withConnection: (prefix, f) =>
        Effect.gen(function* () {
          const ftpConfigRaw = Config.all({
            host: Config.string(`${prefix.toUpperCase()}_HOST`),
            port: withDefault(
              Config.number(`${prefix.toUpperCase()}_PORT`),
              21,
            ),
            user: Config.string(`${prefix.toUpperCase()}_USER`),
            password: Config.redacted(`${prefix.toUpperCase()}_PASS`),
            secure: withDefault(
              Config.boolean(`${prefix.toUpperCase()}_SSL`),
              false,
            ),
          });
          const config = yield* configService.load(ftpConfigRaw);

          return yield* Effect.acquireRelease(
            Effect.sync(() => new Client()),
            (client) =>
              Effect.sync(() => {
                if (!client.closed) client.close();
              }),
          ).pipe(
            Effect.flatMap((client) =>
              Effect.gen(function* () {
                console.log('FTP Config:', config);
                console.log('password raw:', config.password);
                yield* fromPromise(NetworkError, (e) => {
                  return {
                    message: 'Failed to connect to FTP server',
                    operation: 'connect' as const,
                    retryable: isRetryableNetworkError(e),
                    endpoint: `host: ${config.host}, port: ${config.port}, user: ${config.user}, secure: ${config.secure}`,
                  };
                })(() =>
                  client.access({
                    host: config.host,
                    port: config.port,
                    user: config.user,
                    password: Redacted.value(config.password),
                    secure: config.secure,
                  }),
                );
                const ftp = {
                  downloadToStream: (path: string) =>
                    downloadToStream(client)(path),
                  list: (path: string) => list(client)(path),
                  getFileInfo: (path: string) => getFileInfo(client)(path),
                  uploadFromStream: (
                    source: Stream<Uint8Array>,
                    remotePath: string,
                  ) => uploadFromStream(client)(source, remotePath),
                  download: (transportInformation: FileTransportInfo) =>
                    download(client)(transportInformation),
                  upload: (transportInformation: FileTransportInfo) =>
                    upload(client)(transportInformation),
                };
                return yield* f(ftp);
              }),
            ),
          );
        }),
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
