import { Effect } from 'effect'

type ContextOfCtor<Ctor> = Ctor extends new (ctx: infer C) => any ? C : never
type WithoutCause<C> = Omit<C, 'cause'>

/**
 * Creates an Effect from a promise-returning function, catching errors and wrapping them in a specific error type.
 *
 * @param ErrorType The constructor of the error type to wrap rejected promises in.
 *
 * @param buildContext A function that generates the context for the error constructor from the caught error.
 *
 * @returns A function that takes a promise-returning task and returns an Effect.
 *
 * @template Ctor Ctor extends new (ctx: any) => any
 *
 * @template A A
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
 * Creates an Effect from a synchronous function, catching potential errors and wrapping them in a specified error type.
 *
 * @param ErrorType The constructor of the error class to wrap exceptions in.
 *
 * @param buildContext A function that generates the error context from the caught exception.
 *
 * @returns A function that takes a sync task and returns an Effect.
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
 * Validates a condition and returns a successful Effect if true, or a failed Effect containing an instance of the provided ErrorType if false.
 *
 * @param condition The boolean condition to evaluate.
 *
 * @param ErrorType The constructor function for the error to be thrown if the condition is false.
 *
 * @param buildContext A function that returns the error context payload required by the ErrorType constructor.
 *
 * @returns An Effect that yields void on success or fails with an instance of ErrorType.
 */
export function ensure<Ctor extends new (ctx: any) => any>(
  condition: boolean,
  ErrorType: Ctor,
  buildContext: () => WithoutCause<ContextOfCtor<Ctor>>,
): Effect.Effect<void, InstanceType<Ctor>> {
  return condition ? Effect.void : Effect.fail(new ErrorType(buildContext()))
}

/**
 * Validates a boolean condition provided as an Effect. If the condition is false, it fails with the specified error type.
 *
 * @param condition The effect returning a boolean condition to validate.
 *
 * @param ErrorType The constructor class to instantiate if the condition fails.
 *
 * @param buildContext A factory function to generate the constructor arguments, optionally receiving the original error.
 *
 * @returns An effect that succeeds with void or fails with an instance of ErrorType.
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
