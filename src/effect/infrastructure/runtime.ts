import { Effect } from 'effect';
import { MainLayer } from './layer.js';
import { Result } from 'effect/Result';
import { Layer, provide } from 'effect/Layer';

export const makeRunnerAsReturn =
  <BaseR, BaseE>(baseLayer: Layer<BaseR, BaseE, never>) =>
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    overrideLayer?: Layer<any, any, any>,
  ): Promise<Result<A, E>> => {
    const layer = overrideLayer ? provide(overrideLayer, baseLayer) : baseLayer;

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
  };

export const makeRunner =
  <BaseR, BaseE, R>(baseLayer: Layer<BaseR, BaseE, R>) =>
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    overrideLayer?: Layer<any, any, any>,
  ): Promise<A> => {
    const layer = overrideLayer ? provide(overrideLayer, baseLayer) : baseLayer;

    return effect.pipe(
      Effect.catchCause((cause) =>
        Effect.logError('Execution failed', cause).pipe(
          Effect.andThen(Effect.failCause(cause)),
        ),
      ),
      Effect.provide(layer),
      Effect.scoped,
      (e) => Effect.runPromise(e as Effect.Effect<A, E | BaseE, never>),
    );
  };

export const runWithEnvOrThrow = makeRunner(MainLayer);

export const runWithEnv = makeRunnerAsReturn(MainLayer);
