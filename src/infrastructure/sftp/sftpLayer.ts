import { Effect, Layer, ServiceMap, Config, Option } from 'effect';
import { Client } from 'ssh2';
import { ConfigError, withDefault } from 'effect/Config';
import { NetworkError } from '../../errors.js';
import { ConfigProviderLive, ConfigService } from '../config.js';
import { unwrapPassword } from '../../shared/effect/option.js';
import { AppError } from '../../base-error.js';
import { Scope } from 'effect/Scope';
import { FileTransportInfo } from '../../gyomu/file/transport.js';
import { Stream } from 'effect/Stream';
import {
  download,
  downloadToStream,
  getFileInfo,
  list,
  upload,
  uploadFromStream,
} from './internals/sftpClient.js';
import { platform } from '../../platform/index.js';
import { connectEffect } from './internals/sftpClient.js';

//type FtpConfig = Config.Success<typeof ftpConfigRaw>;

export class SftpService extends ServiceMap.Service<
  SftpService,
  {
    withConnection: <A, R = never>(
      prefix: string,
      f: (sftp: {
        download: (
          transportInformation: FileTransportInfo,
        ) => Effect.Effect<boolean, AppError | NetworkError, R>;
        downloadToStream: (
          path: string,
        ) => Stream<Uint8Array, AppError | NetworkError, R>;
        list: (
          path: string,
        ) => Effect.Effect<string[], AppError | NetworkError, R>;
        getFileInfo(path: string): Effect.Effect<
          {
            size: number;
            date: Date;
          },
          AppError | NetworkError,
          R
        >;
        upload: (
          transportInformation: FileTransportInfo,
        ) => Effect.Effect<void, AppError | NetworkError, R>;
        uploadFromStream(
          source: Stream<Uint8Array, AppError | NetworkError, R>,
          remotePath: string,
        ): Effect.Effect<void, AppError | NetworkError, R>;
      }) => Effect.Effect<A, AppError | NetworkError | ConfigError, R>,
    ) => Effect.Effect<A, AppError | NetworkError | ConfigError, R | Scope>;
  }
>()('SshService', {
  make: Effect.gen(function* () {
    const configService = yield* ConfigService;

    return {
      withConnection: (prefix, f) =>
        Effect.gen(function* () {
          const sftpConfigRaw = Config.all({
            host: Config.string(`${prefix.toUpperCase()}_HOST`),
            port: withDefault(
              Config.number(`${prefix.toUpperCase()}_PORT`),
              22,
            ),
            user: Config.string(`${prefix.toUpperCase()}_USER`),
            password: Config.option(
              Config.redacted(`${prefix.toUpperCase()}_PASS`),
            ),
            privateKeyFilename: Config.option(
              Config.string(`${prefix.toUpperCase()}_PRIVATE_KEY_FILENAME`),
            ),
          });
          const config = yield* configService.load(sftpConfigRaw);
          const privateKeyFilename = Option.getOrUndefined(
            config.privateKeyFilename,
          );
          return yield* Effect.acquireRelease(
            Effect.sync(() => new Client()),
            (client) =>
              Effect.sync(() => {
                if (client) client.end();
              }),
          ).pipe(
            Effect.flatMap((client) =>
              Effect.gen(function* () {
                yield* connectEffect(client, {
                  host: config.host,
                  port: config.port,
                  username: config.user,
                  password: unwrapPassword(config.password),
                  privateKey: privateKeyFilename
                    ? platform.readFileSync(privateKeyFilename, 'utf-8')
                    : undefined,
                });

                const sftp = {
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
                return yield* f(sftp);
              }),
            ),
          );
        }),
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make).pipe(
    Layer.provide(ConfigProviderLive),
  );
}
