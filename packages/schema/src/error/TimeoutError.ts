import { Data } from 'effect'
import { Severity, withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

/**
 * Defines the context for a timeout error, including the action that timed out and relevant timing parameters.
 */
export interface TimeoutErrorContext extends AppErrorContext {
  /**
   * The specific operation or action that exceeded its allowed time.
   */
  readonly action: string

  /**
   * The duration in seconds after which the operation was considered timed out.
   */
  readonly timeoutSeconds: number

  /**
   * Optional polling or retry interval in seconds, if applicable to the timed-out action.
   */
  readonly intervalSeconds?: number

  /**
   * The actual time elapsed in milliseconds before the timeout was triggered.
   */
  readonly elapsedMs?: number
}

/**
 * Represents a timeout error occurring during an operation, marked as a retryable error.
 */
export class TimeoutError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/TimeoutError')<TimeoutErrorContext>,
  { severity: Severity.ERROR, isRetryable: () => true },
) {}
