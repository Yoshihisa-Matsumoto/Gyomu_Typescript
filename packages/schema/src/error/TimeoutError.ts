import { Data } from 'effect'
import { Severity, withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

export interface TimeoutErrorContext extends AppErrorContext {
  readonly action: string
  readonly timeoutSeconds: number
  readonly intervalSeconds?: number
  readonly elapsedMs?: number
}
export class TimeoutError extends withErrorTraits(
  Data.TaggedError('TimeoutError')<TimeoutErrorContext>,
  { severity: Severity.ERROR, isRetryable: () => true },
) {}
