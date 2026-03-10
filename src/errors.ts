import { AppError, AppErrorCtor, Severity } from './base-error';

export function unknownError<E extends AppError>(
  ErrorType: AppErrorCtor<E>,
  error: unknown,
  message = 'Unknown error occurred',
): E {
  if (error instanceof ErrorType) return error;
  if (error instanceof AppError) return error as E;
  const useMessage =
    message ??
    (error instanceof Error ? error.message : 'Unknown error occurred');

  return new ErrorType(useMessage, { cause: error });
}
export class ValueError extends AppError {
  readonly kind = 'ValueError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class DBError extends AppError {
  readonly kind = 'DBError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class TimeoutError extends AppError {
  readonly kind = 'TimeoutError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return true;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
export class IOError extends AppError {
  readonly kind = 'IOError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
export class AccessError extends AppError {
  readonly kind = 'AccessError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class CriticalError extends AppError {
  readonly kind = 'CriticalError';
  severity = Severity.FATAL;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class GyomuError extends AppError {
  readonly kind = 'GyomuError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
export class GyomuErrorWithRetry extends AppError {
  readonly kind = 'GyomuErrorWithRetry';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    if (this.cause instanceof AppError) {
      return this.cause.isRetryable();
    }
    return true;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class NetworkError extends AppError {
  readonly kind = 'NetworkError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class ServerError extends AppError {
  readonly kind = 'ServerError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
