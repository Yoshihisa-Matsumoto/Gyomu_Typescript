import { Data } from 'effect';
import { AppErrorContext, Severity, withErrorTraits } from './BaseError.js';

export interface TimeoutErrorContext extends AppErrorContext {
  readonly action: string;
  readonly timeoutSeconds: number;
  readonly intervalSeconds?: number;
  readonly elapsedMs?: number;
}
export class TimeoutError extends withErrorTraits(
  Data.TaggedError('TimeoutError')<TimeoutErrorContext>,
  { severity: Severity.ERROR, isRetryable: () => true },
) {}
