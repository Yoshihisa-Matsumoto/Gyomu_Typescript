import { Config, Context, Effect, Layer, Option } from 'effect'
import { Client } from 'ssh2'
import { withDefault } from 'effect/Config'
import { withOptional } from '@gyomu/schema'
import { unwrapPassword } from '@gyomu/schema/effect'
import { ConfigService } from '../config.js'
import { readStringFromFile } from '../fs/fs-utils.js'
import { connectEffect, execute } from './internals/sshClient.js'

import type { Scope } from 'effect/Scope'
import type { ConfigError, IOError, NetworkError } from '@gyomu/schema'
import type { FileSystem } from 'effect'

// type FtpConfig = Config.Success<typeof ftpConfigRaw>;

/**
 * Provides a service for managing SSH connections and executing commands on remote hosts.
 */
export class SshService extends Context.Service<
  SshService,
  {
    withConnection: <A, R = never>(
      prefix: string,
      f: (ssh: {
        execute: (
          command: string,
          options: {
            requireShell?: boolean
            workingDirectory?: string
            noTrimOutput?: boolean
          },
        ) => Effect.Effect<
          {
            exitCode: number | null
            result: string
            error: string
          },
          NetworkError,
          R
        >
      }) => Effect.Effect<A, NetworkError | ConfigError, R>,
    ) => Effect.Effect<A, NetworkError | IOError | ConfigError, R | Scope | FileSystem.FileSystem>
  }
>()('SshService', {
  make: Effect.gen(function* () {
    const configService = yield* ConfigService

    return {
      withConnection: (prefix, f) =>
        Effect.gen(function* () {
          const sshConfigRaw = Config.all({
            host: Config.string(`${prefix.toUpperCase()}_HOST`),
            port: withDefault(Config.number(`${prefix.toUpperCase()}_PORT`), 22),
            user: Config.string(`${prefix.toUpperCase()}_USER`),
            password: Config.option(Config.redacted(`${prefix.toUpperCase()}_PASS`)),
            privateKeyFilename: Config.option(
              Config.string(`${prefix.toUpperCase()}_PRIVATE_KEY_FILENAME`),
            ),
          })

          const config = yield* configService.load(sshConfigRaw)
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

                const ssh = {
                  execute: (
                    command: string,
                    options: {
                      requireShell?: boolean
                      workingDirectory?: string
                      noTrimOutput?: boolean
                    },
                  ) => execute(client)(command, options),
                }
                return yield* f(ssh)
              }),
            ),
          )
        }),
    }
  }),
}) {
  /**
   * The default live implementation layer for the SshService.
   */
  static readonly live = Layer.effect(this, this.make)
}
