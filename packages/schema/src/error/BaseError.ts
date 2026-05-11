export enum Severity {
  INFO,
  WARN,
  ERROR,
  FATAL,
}

export interface AppErrorContext {
  readonly message: string
  readonly cause: unknown
  readonly context?: string // 発生箇所
  readonly details?: unknown // 任意の追加情報
}

export interface ErrorTraits<Ctx> {
  readonly severity: Severity
  isRetryable: (ctx: Ctx) => boolean
}

export const withErrorTraits = <T extends { new (...args: Array<any>): any }>(
  Base: T,
  traits?: Partial<ErrorTraits<ContextOfCtor<T>>>,
) => {
  const merged = { ...defaultTraits, ...traits }
  return class extends Base {
    readonly severity = merged.severity
    isRetryable = merged.isRetryable(this as ContextOfCtor<T>)
  }
}
const defaultTraits: ErrorTraits<unknown> = {
  severity: Severity.ERROR,
  isRetryable: () => false,
}

type ContextOfCtor<Ctor> = Ctor extends new (ctx: infer C) => any ? C : never

export function wrapInfraError<Ctor extends new (ctx: any) => any>(
  ErrorType: Ctor,
  error: unknown,
  buildContext?: (e: unknown) => Partial<ContextOfCtor<Ctor>>,
): InstanceType<Ctor> {
  if (error instanceof ErrorType) return error

  const base = (buildContext?.(error) ?? {}) as ContextOfCtor<Ctor>

  return new ErrorType({
    ...base,
    message: base.message ?? (error instanceof Error ? error.message : 'Unknown error occurred'),
    cause: error,
  })
}
