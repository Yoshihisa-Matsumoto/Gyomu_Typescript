import { Data } from 'effect';

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
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}
export type AppErrorCtor<E extends AppError = AppError> = new (
  message: string,
  cause?: unknown,
) => E;

export function unknownError<E extends AppError>(
  ErrorType: AppErrorCtor<E>,
  error: unknown,
  message = 'Unknown error occurred',
): E {
  if (error instanceof ErrorType) return error;
  if (error instanceof AppError) return error as E;
  const useMessage = message
    ? `${message} cause: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    : error instanceof Error
      ? error.message
      : 'Unknown error occurred';

  return new ErrorType(useMessage, { cause: error });
}
