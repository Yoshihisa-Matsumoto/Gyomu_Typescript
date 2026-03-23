import * as Data from 'effect/Data';

export enum Severity {
  INFO,
  WARN,
  ERROR,
  FATAL,
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AppErrorContext {}
export abstract class AppError extends Data.Error<AppErrorContext> {
  abstract readonly _tag: string;
  abstract severity: Severity;
  abstract isRetryable(): boolean;

  readonly message: string;
  readonly cause?: unknown;

  protected constructor(message: string, cause?: unknown) {
    super();
    this.message = message;
    this.cause = cause;

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export type AppErrorCtor<E extends AppError = AppError> = new (
  message: string,
  cause?: unknown,
) => E;
