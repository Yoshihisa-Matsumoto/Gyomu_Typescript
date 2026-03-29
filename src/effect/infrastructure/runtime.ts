import { Effect } from 'effect';
import { RunEnv } from './layer.js';
import { Result } from 'effect/Result';
import { Layer, mergeAll } from 'effect/Layer';

export const runWithEnvOrThrow = <A, E>(
  effect: Effect.Effect<A, E, any>,
  additionalLayer?: Layer<any>,
): Promise<A> => {
  const layer = additionalLayer ? mergeAll(RunEnv, additionalLayer) : RunEnv;
  return effect.pipe(
    Effect.catchCause((cause) =>
      Effect.logError('Execution failed', cause).pipe(
        Effect.andThen(Effect.failCause(cause)),
      ),
    ),
    Effect.provide(layer),

    Effect.scoped,
    (e) => Effect.runPromise(e as Effect.Effect<A, E, never>),
  );
  // // 1. まず環境を適用した Effect を作る
  // const program = Effect.gen(function* () {
  //   return yield* effect;
  // }).pipe(Effect.provide(MainLayer), Effect.scoped);

  // // 2. ここで型を Effect<A, E, never> に強制して実行する
  // return Effect.runPromise(program as Effect.Effect<A, E, never>);
};

export const runWithEnv = <A, E>(
  effect: Effect.Effect<A, E, any>,
  additionalLayer?: Layer<any>,
): Promise<Result<A, E>> => {
  const layer = additionalLayer ? mergeAll(RunEnv, additionalLayer) : RunEnv;

  return effect.pipe(
    Effect.catchCause((cause) =>
      Effect.logError('Execution failed', cause).pipe(
        Effect.andThen(Effect.failCause(cause)),
      ),
    ),
    Effect.result,
    Effect.provide(layer),

    Effect.scoped,
    (e) => Effect.runPromise(e as Effect.Effect<Result<A, E>, never, never>),
  );
  // // 1. まず環境を適用した Effect を作る
  // const program = Effect.gen(function* () {
  //   return yield* effect;
  // }).pipe(Effect.provide(MainLayer), Effect.scoped);

  // // 2. ここで型を Effect<A, E, never> に強制して実行する
  // return Effect.runPromise(program as Effect.Effect<A, E, never>);
};
