import { ConfigProvider, Context, Effect, Layer } from 'effect'
import { ConfigError, IOError, wrapInfraError } from '@gyomu/schema'
import { fromSync } from '@gyomu/schema/effect'
import { readStringFromFile } from './fs/fs-utils.js'
import type { Config, FileSystem } from 'effect'
// const makeConfigProvider = Effect.gen(function* () {
//   const dotEnv = yield* ConfigProvider.fromDotEnv();
//   return ConfigProvider.orElse(dotEnv, ConfigProvider.fromEnv());
// });

export const ConfigProviderLive = Layer.unwrap(
  Effect.map(
    Effect.gen(function* () {
      const dotEnv = yield* ConfigProvider.fromDotEnv().pipe(
        Effect.mapError((e) =>
          wrapInfraError(ConfigError, e, () => ({
            message: 'Failed to load .env file',
            source: 'file' as const,
            phase: 'load' as const,
          })),
        ),
      )
      return ConfigProvider.orElse(ConfigProvider.fromEnv(), dotEnv)
    }),
    (provider) => ConfigProvider.layer(provider),
  ),
)
export const ConfigProviderTest = ConfigProvider.fromUnknown({
  LOG_LEVEL: 'debug',
}).pipe(ConfigProvider.layer)

export class ConfigService extends Context.Service<
  ConfigService,
  {
    load: <A>(
      config: Config.Config<A>,
      options?: { file: string },
    ) => Effect.Effect<A, ConfigError | IOError, FileSystem.FileSystem>
  }
>()('ConfigService', {
  make: Effect.gen(function* () {
    const provider = yield* ConfigProvider.ConfigProvider
    const fromJsonFile = (
      path: string,
    ): Effect.Effect<ConfigProvider.ConfigProvider, IOError, FileSystem.FileSystem> =>
      Effect.gen(function* () {
        const content = yield* readStringFromFile(path, 'utf-8')

        const json = yield* fromSync(IOError, () => ({
          message: 'fail to parse JSON',
          layer: 'filesystem' as const,
          operation: 'transform' as const,
          target: content,
        }))(() => JSON.parse(content))
        return ConfigProvider.fromUnknown(json)
      })
    return {
      load: (config, options) =>
        Effect.gen(function* () {
          if (options?.file) {
            const fileLoader = yield* fromJsonFile(options.file)
            return yield* config.parse(fileLoader).pipe(
              Effect.mapError((e) =>
                wrapInfraError(ConfigError, e, () => {
                  return {
                    message: `Fail to load from file: ${options.file}`,
                    source: 'file' as const,
                    phase: 'load' as const,
                  }
                }),
              ),
            )
          }
          return yield* config.parse(provider).pipe(
            Effect.mapError((e) =>
              wrapInfraError(ConfigError, e, () => ({
                message: `Fail to load from env/.env`,
                source: 'env' as const,
                phase: 'load' as const,
              })),
            ),
          )
        }),
    }
  }),
}) {
  static readonly live = Layer.effect(this, this.make)
}

export const ConfigLayer = Layer.mergeAll(
  ConfigProviderLive,
  ConfigService.live,
) satisfies Layer.Layer<ConfigService, ConfigError, FileSystem.FileSystem>

export const ConfigMockLayer = Layer.mergeAll(ConfigProviderTest, ConfigService.live)
