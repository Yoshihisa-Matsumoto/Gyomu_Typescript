import { Config, Context, Effect, Layer, Option } from 'effect'
import { Client } from 'ssh2'
import { withDefault } from 'effect/Config'
import { withOptional } from '@gyomu/core'
import { ConfigService } from '../config.js'
import { unwrapPassword } from '../../../core/dist/effect/index.js'
import { readStringFromFile } from '../fs/fs-utils.js'
import {
  connectEffect,
  download,
  downloadToStream,
  getFileInfo,
  list,
  upload,
  uploadFromStream,
} from './internals/sftpClient.js'
import type { Scope } from 'effect/Scope'
import type { ConfigError, IOError, NetworkError } from '@gyomu/core'
import type { FileTransportInfo } from '@gyomu/core/gyomu/file'
import type { Stream } from 'effect/Stream'
// import { fs } from '../fs/index.js';
import type { FileSystem } from 'effect'

// type FtpConfig = Config.Success<typeof ftpConfigRaw>;

export class SftpService extends Context.Service<
  SftpService,
  {
    withConnection: <A>(
      prefix: string,
      f: (sftp: {
        download: (
          transportInformation: FileTransportInfo,
        ) => Effect.Effect<boolean, IOError | NetworkError, FileSystem.FileSystem>
        downloadToStream: (path: string) => Stream<Uint8Array, IOError | NetworkError>
        list: (path: string) => Effect.Effect<Array<string>, NetworkError>
        getFileInfo: (path: string) => Effect.Effect<
          {
            size: number
            date: Date
          },
          NetworkError
        >
        upload: (
          transportInformation: FileTransportInfo,
        ) => Effect.Effect<void, IOError | NetworkError, FileSystem.FileSystem>
        uploadFromStream: (
          source: Stream<Uint8Array, IOError>,
          remotePath: string,
        ) => Effect.Effect<void, NetworkError>
      }) => Effect.Effect<A, NetworkError | ConfigError | IOError, FileSystem.FileSystem>,
    ) => Effect.Effect<A, NetworkError | ConfigError | IOError, Scope | FileSystem.FileSystem>
  }
>()('SshService', {
  make: Effect.gen(function* () {
    const configService = yield* ConfigService

    return {
      withConnection: (prefix, f) =>
        Effect.gen(function* () {
          const sftpConfigRaw = Config.all({
            host: Config.string(`${prefix.toUpperCase()}_HOST`),
            port: withDefault(Config.number(`${prefix.toUpperCase()}_PORT`), 22),
            user: Config.string(`${prefix.toUpperCase()}_USER`),
            password: Config.option(Config.redacted(`${prefix.toUpperCase()}_PASS`)),
            privateKeyFilename: Config.option(
              Config.string(`${prefix.toUpperCase()}_PRIVATE_KEY_FILENAME`),
            ),
          })
          const config = yield* configService.load(sftpConfigRaw)
          const privateKeyFilename = Option.getOrUndefined(config.privateKeyFilename)
          return yield* Effect.acquireRelease(
            Effect.sync(() => new Client()),
            (client) =>
              Effect.sync(() => {
                client.end()
              }),
          ).pipe(
            Effect.flatMap((client) =>
              Effect.gen(function* () {
                const configObj = withOptional({
                  host: config.host,
                  port: config.port,
                  username: config.user,
                  password: unwrapPassword(config.password),
                  privateKey: privateKeyFilename
                    ? yield* readStringFromFile(privateKeyFilename, 'utf-8')
                    : undefined,
                })
                yield* connectEffect(client, configObj)

                const sftp = {
                  downloadToStream: (path: string) => downloadToStream(client)(path),
                  list: (path: string) => list(client)(path),
                  getFileInfo: (path: string) => getFileInfo(client)(path),
                  uploadFromStream: (source: Stream<Uint8Array, IOError>, remotePath: string) =>
                    uploadFromStream(client)(source, remotePath),
                  download: (transportInformation: FileTransportInfo) =>
                    download(client)(transportInformation),
                  upload: (transportInformation: FileTransportInfo) =>
                    upload(client)(transportInformation),
                }
                return yield* f(sftp)
              }),
            ),
          )
        }),
    }
  }),
}) {
  static readonly live = Layer.effect(this, this.make)
}
