import { Effect } from 'effect'

type ContextOfCtor<Ctor> = Ctor extends new (ctx: infer C) => any ? C : never
type WithoutCause<C> = Omit<C, 'cause'>
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
export function ensure<Ctor extends new (ctx: any) => any>(
  condition: boolean,
  ErrorType: Ctor,
  buildContext: () => WithoutCause<ContextOfCtor<Ctor>>,
): Effect.Effect<void, InstanceType<Ctor>> {
  return condition ? Effect.void : Effect.fail(new ErrorType(buildContext()))
}
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
