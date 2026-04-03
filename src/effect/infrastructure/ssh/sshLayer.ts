import { Effect, Layer, ServiceMap, Config, Option } from 'effect';
import { Client } from 'ssh2';
import { ConfigError, withDefault } from 'effect/Config';
import { NetworkError } from '../../../errors.js';
import { ConfigProviderLive, ConfigService } from '../config.js';
import { unwrapPassword } from '../../index.js';
import { AppError } from '../../../base-error.js';
import { Scope } from 'effect/Scope';
import { execute } from './internals/sshClient.js';
import { platform } from '../../../platform/index.js';
import { connectEffect } from './internals/sshClient.js';

//type FtpConfig = Config.Success<typeof ftpConfigRaw>;

export class SshService extends ServiceMap.Service<
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
          AppError | NetworkError,
          R
        >;
      }) => Effect.Effect<A, AppError | NetworkError | ConfigError, R>,
    ) => Effect.Effect<A, AppError | NetworkError | ConfigError, R | Scope>;
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
                yield* connectEffect(client, {
                  host: config.host,
                  port: config.port,
                  username: config.user,
                  password: unwrapPassword(config.password),
                  privateKey: privateKeyFilename
                    ? platform.readFileSync(privateKeyFilename, 'utf-8')
                    : undefined,
                });

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
  static readonly live = Layer.effect(this, this.make).pipe(
    Layer.provide(ConfigProviderLive),
  );
}
