import { Cause, Effect, Exit, Layer, Option, Result } from 'effect'

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

    const runnable = effect.pipe(Effect.provide(layer), Effect.scoped)

    return Effect.runPromiseExit(runnable as Effect.Effect<A, E, never>).then((exit) => {
      if (Exit.isSuccess(exit)) {
        return Result.succeed(exit.value)
      }

      const cause = exit.cause

      const failure = Cause.findErrorOption(cause)

      if (Option.isSome(failure)) {
        return Result.fail(failure.value)
      }

      // Runtime / Die / Layer failure
      Effect.runSync(Effect.logError('Execution failed', cause))

      return Promise.reject(cause)
    })
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

    const runnable = effect.pipe(Effect.provide(layer), Effect.scoped)

    return Effect.runPromiseExit(runnable as Effect.Effect<A, E, never>).then((exit) => {
      if (Exit.isSuccess(exit)) {
        return exit.value
      }

      const cause = exit.cause

      const failure = Cause.findErrorOption(cause)

      if (Option.isSome(failure)) {
        return Promise.reject(failure.value)
      }

      // Runtime / Die / Layer failure
      Effect.runSync(Effect.logError('Execution failed', cause))

      return Promise.reject(cause)
    })
  }
