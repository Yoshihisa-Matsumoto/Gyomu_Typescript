export enum Severity {
  INFO,
  WARN,
  ERROR,
  FATAL,
}
export abstract class AppError extends Error {
  abstract readonly kind: string;
  abstract severity: Severity;
  abstract isRetryable(): boolean;
  readonly cause?: unknown;

  protected constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}
export type AppErrorCtor<E extends AppError = AppError> = new (
  message: string,
  cause?: unknown,
) => E;
