import { Config, ConfigProvider, Effect, Layer, ServiceMap } from 'effect';
import { ConfigError } from 'effect/Config';
import { IOError } from '../errors.js';
import { fs } from './fs/index.js';
import { fromSync } from '../shared/effect/core.js';
// const makeConfigProvider = Effect.gen(function* () {
//   const dotEnv = yield* ConfigProvider.fromDotEnv();
//   return ConfigProvider.orElse(dotEnv, ConfigProvider.fromEnv());
// });

export const ConfigProviderLive = Layer.unwrap(
  Effect.map(
    Effect.gen(function* () {
      const dotEnv = yield* ConfigProvider.fromDotEnv();
      return ConfigProvider.orElse(dotEnv, ConfigProvider.fromEnv());
    }),
    (provider) => ConfigProvider.layer(provider),
  ),
);
export class ConfigService extends ServiceMap.Service<
  ConfigService,
  {
    load: <A>(
      config: Config.Config<A>,
      options?: { file: string },
    ) => Effect.Effect<A, ConfigError | IOError>;
  }
>()('ConfigService', {
  make: Effect.gen(function* () {
    const provider = yield* ConfigProvider.ConfigProvider;
    const fromJsonFile = (
      path: string,
    ): Effect.Effect<ConfigProvider.ConfigProvider, IOError> =>
      Effect.gen(function* () {
        const json = yield* fromSync(
          IOError,
          `Failed to read config from ${path}`,
        )(() => {
          const content = fs.readFileSync(path, 'utf-8');
          return JSON.parse(content);
        });
        return ConfigProvider.fromUnknown(json);
      });
    return {
      load: (config, options) =>
        Effect.gen(function* () {
          if (options?.file) {
            const fileLoader = yield* fromJsonFile(options.file);
            return yield* config.parse(fileLoader);
          }
          return yield* config.parse(provider);
        }),
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}

export const ConfigLayer = Layer.mergeAll(
  ConfigProviderLive,
  ConfigService.live,
);
