/**
 * Defines the severity levels for application errors.
 */
export enum Severity {
  INFO,
  WARN,
  ERROR,
  FATAL,
}

/**
 * Defines the shared context for application errors, including metadata for debugging and error tracing.
 */
export interface AppErrorContext {
  /**
   * The human-readable error message.
   */
  readonly message: string

  /**
   * The original error or exception that caused this error.
   */
  readonly cause: unknown

  /**
   * The operational context or location where the error occurred.
   */
  readonly context?: string // 発生箇所

  /**
   * Additional metadata or arbitrary details associated with the error.
   */
  readonly details?: unknown // 任意の追加情報
}

/**
 * Defines behavioral traits for errors, including severity and retryability logic.
 */
export interface ErrorTraits<Ctx> {
  /**
   * The severity level of the error.
   */
  readonly severity: Severity

  /**
   * Determines if the error is retryable based on the provided context.
   *
   * @param ctx The context used to evaluate retryability.
   *
   * @returns True if the error can be retried, false otherwise.
   */
  isRetryable: (ctx: Ctx) => boolean

  /**
   * Determines if the error can be handled by a fallback mechanism based on the provided context.
   *
   * @param ctx The context used to evaluate fallback eligibility.
   *
   * @returns True if the error can fallback, false otherwise.
   */
  canFallback: (ctx: Ctx) => boolean
}

/**
 * Higher-order function to inject error traits into a base error class.
 *
 * @param Base The base error class constructor.
 *
 * @param traits Optional trait overrides to inject into the base class.
 *
 * @returns The enhanced error class constructor.
 */
export const withErrorTraits = <T extends { new (...args: Array<any>): any }>(
  Base: T,
  traits?: Partial<ErrorTraits<ContextOfCtor<T>>>,
) => {
  const merged = { ...defaultTraits, ...traits }
  return class extends Base {
    readonly severity = merged.severity
    isRetryable = merged.isRetryable(this as ContextOfCtor<T>)
    canFallback = merged.canFallback(this as ContextOfCtor<T>)
  }
}
const defaultTraits: ErrorTraits<unknown> = {
  severity: Severity.ERROR,
  isRetryable: () => false,
  canFallback: () => false,
}

type ContextOfCtor<Ctor> = Ctor extends new (ctx: infer C) => any ? C : never

/**
 * Wraps a generic error into a specific application error type, optionally generating context from the original error.
 *
 * @param ErrorType The constructor of the target error type.
 *
 * @param error The original error or exception caught.
 *
 * @param buildContext Optional function to extract context from the original error.
 *
 * @returns The wrapped error instance.
 */
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
    cause: error instanceof Error ? error : new Error(String(error)),
  })
}
