import { ConfigProvider, Context, Effect, FileSystem, Layer } from 'effect'
import { ConfigError, wrapInfraError } from '@gyomu/schema'
import { fromSync } from '@gyomu/schema/effect'
import { readStringFromFile } from './fs/fs-utils.js'
import type { IOError } from '@gyomu/schema'
import type { Config } from 'effect'
// const makeConfigProvider = Effect.gen(function* () {
//   const dotEnv = yield* ConfigProvider.fromDotEnv();
//   return ConfigProvider.orElse(dotEnv, ConfigProvider.fromEnv());
// });

/**
 * Provides a production configuration layer that prioritizes environment variables and falls back to a .env file if available.
 */
export const ConfigProviderLive = Layer.unwrap(
  Effect.map(
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem
      const exists = yield* fileSystem.exists('.env').pipe(
        Effect.mapError((e) =>
          wrapInfraError(ConfigError, e, () => ({
            message: 'Failed to check .env file',
            source: 'file' as const,
            phase: 'load' as const,
          })),
        ),
      )

      if (!exists) {
        return ConfigProvider.fromEnv()
      }

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
    ConfigProvider.layer,
  ),
)

/**
 * Provides a test configuration layer with predefined mock settings.
 */
export const ConfigProviderTest = ConfigProvider.fromUnknown({
  LOG_LEVEL: 'debug',
}).pipe(ConfigProvider.layer)

/**
 * A service that provides functionality to load application configurations from environment variables or local JSON files.
 */
export class ConfigService extends Context.Service<
  ConfigService,
  {
    load: <A>(
      config: Config.Config<A>,
      options?: { file: string },
    ) => Effect.Effect<A, ConfigError, FileSystem.FileSystem>
  }
>()('ConfigService', {
  make: Effect.gen(function* () {
    const provider = yield* ConfigProvider.ConfigProvider
    const fromJsonFile = (
      path: string,
      config: Config.Config<any>,
    ): Effect.Effect<ConfigProvider.ConfigProvider, ConfigError, FileSystem.FileSystem> =>
      Effect.gen(function* () {
        const content = yield* readStringFromFile(path, 'utf-8').pipe(
          Effect.mapError((e) => wrapConfigError(e, config, { file: path })),
        )

        const json = yield* fromSync(ConfigError, () => ({
          message: 'fail to parse JSON',
          phase: 'parse' as const,
          schema: config,
          context: content,
          details: path,
        }))(() => JSON.parse(content))
        return ConfigProvider.fromUnknown(json)
      })
    return {
      load: (config, options) =>
        Effect.gen(function* () {
          if (options?.file) {
            const fileLoader = yield* fromJsonFile(options.file, config)
            return yield* config
              .parse(fileLoader)
              .pipe(Effect.mapError((e) => wrapConfigError(e, config, options)))
          }
          return yield* config
            .parse(provider)
            .pipe(Effect.mapError((e) => wrapConfigError(e, config, options)))
        }),
    }
  }),
}) {
  /**
   * The production layer for the ConfigService.
   */
  static readonly live = Layer.effect(this, this.make)
}

/**
 * Combines the production provider and service into a complete layer for dependency injection.
 */
export const ConfigLayer = Layer.mergeAll(
  ConfigProviderLive,
  ConfigService.live,
) satisfies Layer.Layer<ConfigService, ConfigError, FileSystem.FileSystem>

/**
 * Combines the test provider and service into a layer for testing environments.
 */
export const ConfigMockLayer = Layer.mergeAll(ConfigProviderTest, ConfigService.live)

function wrapConfigError(
  error: Config.ConfigError | IOError,
  rawConfig: Config.Config<any>,
  options?: { file: string },
): ConfigError {
  return new ConfigError({
    cause: error,
    message: options?.file
      ? `Fail to load from file: ${options.file}`
      : `Fail to load from env/.env`,
    phase:
      error._tag == '@gyomu/schema/IOError' || error.cause._tag == 'SourceError'
        ? 'load'
        : 'decode',
    schema: rawConfig,
  })
}
