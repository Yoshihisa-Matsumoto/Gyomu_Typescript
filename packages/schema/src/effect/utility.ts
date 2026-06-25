import { Effect } from 'effect'

type ContextOfCtor<Ctor> = Ctor extends new (ctx: infer C) => any ? C : never
type WithoutCause<C> = Omit<C, 'cause'>

/**
 * Creates an Effect from a promise-returning function, wrapping potential errors using a provided constructor and context builder.
 *
 * @param ErrorType The constructor function to wrap errors with.
 *
 * @param buildContext A function to build the error context from the caught error.
 *
 * @returns A function that takes a promise-returning function and returns an Effect representing its result or the wrapped error.
 */
export const fromPromise =
  <Ctor extends new (ctx: any) => any>(
    ErrorType: Ctor,
    buildContext: (e: unknown) => WithoutCause<ContextOfCtor<Ctor>>,
  ) =>
  <A>(f: () => Promise<A>): Effect.Effect<A, InstanceType<Ctor>> =>
    Effect.tryPromise({
      try: f,
      catch: (e) => {
        return wrapError(ErrorType, e, buildContext)
      },
    })

/**
 * Wraps a synchronous function in an Effect, converting any thrown error into a specified error type.
 *
 * @param ErrorType The constructor of the error to be thrown.
 *
 * @param buildContext A function that builds the context for the error from the caught exception.
 *
 * @returns An effect that executes the function and captures potential errors.
 */
export const fromSync =
  <Ctor extends new (ctx: any) => any>(
    ErrorType: Ctor,
    buildContext: (e: unknown) => WithoutCause<ContextOfCtor<Ctor>>,
  ) =>
  <A>(f: () => A): Effect.Effect<A, InstanceType<Ctor>> =>
    Effect.try({
      try: f,
      catch: (e) => {
        return wrapError(ErrorType, e, buildContext)
      },
    })

function wrapError<Ctor extends new (ctx: any) => any>(
  ErrorType: Ctor,
  error: unknown,
  buildContext?: (e: unknown) => WithoutCause<ContextOfCtor<Ctor>>,
): InstanceType<Ctor> {
  if (error instanceof ErrorType) return error

  const base = (buildContext?.(error) ?? {}) as ContextOfCtor<Ctor>

  return new ErrorType({
    ...base,
    message: base.message ?? (error instanceof Error ? error.message : 'Unknown error occurred'),
    cause: error,
  })
}

/**
 * Fails the effect with the specified error type if the condition is false.
 *
 * @param condition The condition to check.
 *
 * @param ErrorType The constructor of the error to return if the condition is false.
 *
 * @param buildContext A function that builds the context for the error constructor.
 *
 * @returns An effect that succeeds with void if the condition is true, or fails with the specified error.
 */
export function ensure<Ctor extends new (ctx: any) => any>(
  condition: boolean,
  ErrorType: Ctor,
  buildContext: () => WithoutCause<ContextOfCtor<Ctor>>,
): Effect.Effect<void, InstanceType<Ctor>> {
  return condition ? Effect.void : Effect.fail(new ErrorType(buildContext()))
}

/**
 * Ensures a condition is met within an effect chain, failing with a custom error type if the condition is false or if the underlying effect fails.
 *
 * @param condition The condition to validate.
 *
 * @param ErrorType The constructor of the error to be thrown on failure.
 *
 * @param buildContext A factory function to generate the error context, optionally receiving the original error.
 *
 * @returns An Effect that yields void on success, or fails with an instance of ErrorType.
 */
export function ensureEffect<Ctor extends new (ctx: any) => any, R = never>(
  condition: Effect.Effect<boolean, unknown, R>,
  ErrorType: Ctor,
  buildContext: (e?: unknown) => ContextOfCtor<Ctor>,
): Effect.Effect<void, InstanceType<Ctor>, R> {
  return condition.pipe(
    Effect.mapError((e) => {
      const base = buildContext(e)
      return new ErrorType({
        ...base,
        cause: e, // ✅ 強制注入
      })
    }),
    Effect.flatMap((ok) => (ok ? Effect.void : Effect.fail(new ErrorType(buildContext())))),
  )
}
