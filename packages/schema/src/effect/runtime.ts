import { Effect, Layer } from 'effect'
import type { Result } from 'effect'

/**
 * Creates a runner function that executes an Effect with a base layer, returning a Result of the execution.
 *
 * @param baseLayer The base service layer to provide to the effect.
 *
 * @param effect The effect to execute.
 *
 * @param overrideLayer Optional layer to merge with the base layer.
 *
 * @returns A promise resolving to a Result containing the effect output or failure.
 */
export const makeRunnerAsReturn =
  <BaseR, BaseE>(baseLayer: Layer.Layer<BaseR, BaseE, never>) =>
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    overrideLayer?: Layer.Layer<any, any, any>,
  ): Promise<Result.Result<A, E>> => {
    const layer = overrideLayer ? baseLayer.pipe(Layer.provideMerge(overrideLayer)) : baseLayer

    return effect.pipe(
      Effect.catchCause((cause) =>
        Effect.logError('Execution failed', cause).pipe(Effect.andThen(Effect.failCause(cause))),
      ),
      Effect.result,
      Effect.provide(layer),
      Effect.scoped,
      (e) => Effect.runPromise(e as Effect.Effect<Result.Result<A, E>, never, never>),
    )
  }

/**
 * Creates a runner function that executes an Effect with a base layer, returning a Promise of the result.
 *
 * @param baseLayer The base service layer.
 *
 * @param effect The effect to execute.
 *
 * @param overrideLayer Optional layer to merge with the base layer.
 *
 * @returns A promise resolving to the effect output.
 */
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
