import { Effect, Layer } from 'effect'
import type { Result } from 'effect/Result'

export const makeRunnerAsReturn =
  <BaseR, BaseE>(baseLayer: Layer.Layer<BaseR, BaseE, never>) =>
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    overrideLayer?: Layer.Layer<any, any, any>,
  ): Promise<Result<A, E>> => {
    const layer = overrideLayer ? baseLayer.pipe(Layer.provideMerge(overrideLayer)) : baseLayer

    return effect.pipe(
      Effect.catchCause((cause) =>
        Effect.logError('Execution failed', cause).pipe(Effect.andThen(Effect.failCause(cause))),
      ),
      Effect.result,
      Effect.provide(layer),
      Effect.scoped,
      (e) => Effect.runPromise(e as Effect.Effect<Result<A, E>, never, never>),
    )
  }

export const makeRunner =
  <BaseR, BaseE>(baseLayer: Layer.Layer<BaseR, BaseE, never>) =>
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    overrideLayer?: Layer.Layer<any, any, any>,
  ): Promise<A> => {
    const layer = overrideLayer ? baseLayer.pipe(Layer.provideMerge(overrideLayer)) : baseLayer

    return effect.pipe(
      Effect.catchCause((cause) =>
        Effect.logError('Execution failed', cause).pipe(Effect.andThen(Effect.failCause(cause))),
      ),
      Effect.provide(layer),
      Effect.scoped,
      (e) => Effect.runPromise(e as Effect.Effect<A, E | BaseE, never>),
    )
  }

// export const runWithEnvOrThrow = makeRunner(MainLayer);

// export const runWithEnv = makeRunnerAsReturn(MainLayer);
