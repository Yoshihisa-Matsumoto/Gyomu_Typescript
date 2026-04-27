import { AppError, Severity } from './BaseError.js';

export class ValueError extends AppError {
  readonly _tag = 'ValueError';
  severity = Severity.ERROR;
  isRetryable(): boolean {
    return false;
  }
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
