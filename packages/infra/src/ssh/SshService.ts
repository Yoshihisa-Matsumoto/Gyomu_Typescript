import { Effect, Layer, Context, Config, Option, FileSystem } from 'effect';
import { Client } from 'ssh2';
import { withDefault } from 'effect/Config';
import { NetworkError, ConfigError, IOError } from '@gyomu/core';
import { ConfigProviderLive, ConfigService } from '../config.js';
import { unwrapPassword } from '../../../core/dist/effect/index.js';
import { Scope } from 'effect/Scope';
import { execute } from './internals/sshClient.js';

import { connectEffect } from './internals/sshClient.js';
import { readStringFromFile } from '../fs/fs-utils.js';
import { withOptional } from '@gyomu/core';

//type FtpConfig = Config.Success<typeof ftpConfigRaw>;

export class SshService extends Context.Service<
  SshService,
  {
    withConnection: <A, R = never>(
      prefix: string,
      f: (ssh: {
        execute(
          command: string,
          options: {
            requireShell?: boolean;
            workingDirectory?: string;
            noTrimOutput?: boolean;
          },
        ): Effect.Effect<
          {
            exitCode: number | null;
            result: string;
            error: string;
          },
          NetworkError,
          R
        >;
      }) => Effect.Effect<A, NetworkError | ConfigError, R>,
    ) => Effect.Effect<
      A,
      NetworkError | IOError | ConfigError,
      R | Scope | FileSystem.FileSystem
    >;
  }
>()('SshService', {
  make: Effect.gen(function* () {
    const configService = yield* ConfigService;

    return {
      withConnection: (prefix, f) =>
        Effect.gen(function* () {
          const sshConfigRaw = Config.all({
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
          const config = yield* configService.load(sshConfigRaw);
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
                const configObj = withOptional({
                  host: config.host,
                  port: config.port,
                  username: config.user,
                  password: unwrapPassword(config.password),
                  privateKey: privateKeyFilename
                    ? yield* readStringFromFile(privateKeyFilename, 'utf-8')
                    : undefined,
                });
                yield* connectEffect(client, configObj);

                const ssh = {
                  execute: (
                    command: string,
                    options: {
                      requireShell?: boolean;
                      workingDirectory?: string;
                      noTrimOutput?: boolean;
                    },
                  ) => execute(client)(command, options),
                };
                return yield* f(ssh);
              }),
            ),
          );
        }),
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
