import { ConfigProvider, Effect } from 'effect';

export const makeConfigProvider = Effect.gen(function* () {
  const dotEnv = yield* ConfigProvider.fromDotEnv();
  return ConfigProvider.orElse(dotEnv, ConfigProvider.fromEnv());
});
