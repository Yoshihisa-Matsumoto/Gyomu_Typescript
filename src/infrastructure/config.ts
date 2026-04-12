import { Config, ConfigProvider, Effect, Layer, ServiceMap } from 'effect';
import { ConfigError } from 'effect/Config';

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
    load: <A>(config: Config.Config<A>) => Effect.Effect<A, ConfigError>;
  }
>()('ConfigService', {
  make: Effect.gen(function* () {
    const provider = yield* ConfigProvider.ConfigProvider;

    return {
      load: (config) => config.parse(provider),
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}

export const ConfigLayer = Layer.mergeAll(
  ConfigProviderLive,
  ConfigService.live,
);
