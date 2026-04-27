import {
  Config,
  ConfigProvider,
  Effect,
  Layer,
  ServiceMap,
  FileSystem,
} from 'effect';
import { IOError, ConfigError } from '../errors.js';
import { fromSync } from '@gyomu/shared/effect';
import { option } from 'effect/Effect';
import { readStringFromFile } from './fs/fs-utils.js';
import { unknownError } from '@gyomu/shared';
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
    ) => Effect.Effect<A, ConfigError | IOError, FileSystem.FileSystem>;
  }
>()('ConfigService', {
  make: Effect.gen(function* () {
    const provider = yield* ConfigProvider.ConfigProvider;
    const fromJsonFile = (
      path: string,
    ): Effect.Effect<
      ConfigProvider.ConfigProvider,
      IOError,
      FileSystem.FileSystem
    > =>
      Effect.gen(function* () {
        const content = yield* readStringFromFile(path, 'utf-8');

        const json = yield* fromSync(
          IOError,
          `fail to parse JSON`,
        )(() => JSON.parse(content));
        return ConfigProvider.fromUnknown(json);
      });
    return {
      load: (config, options) =>
        Effect.gen(function* () {
          if (options?.file) {
            const fileLoader = yield* fromJsonFile(options.file);
            return yield* config
              .parse(fileLoader)
              .pipe(
                Effect.mapError((e) =>
                  unknownError(
                    ConfigError,
                    e,
                    `Fail to load from file: ${options.file}`,
                  ),
                ),
              );
          }
          return yield* config
            .parse(provider)
            .pipe(
              Effect.mapError((e) =>
                unknownError(ConfigError, e, `Fail to load from env/.env`),
              ),
            );
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
