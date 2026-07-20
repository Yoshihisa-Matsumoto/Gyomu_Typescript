import type { AiError } from '../error/AiError.js'

/**
 * Defines an observer interface for listening to retry attempts.
 */
export interface RetryObserver {
  /**
   * Invoked when a retry attempt occurs.
   *
   * @param params The retry attempt details including the error encountered, the current attempt count, and the delay in milliseconds before the next attempt.
   */
  onRetry: (params: { error: AiError; attempt: number; delayMs: number }) => void
}

/**
 * Defines configuration options for retry logic, including attempt limits and observer hooks.
 */
export interface RetryOption {
  /**
   * The maximum number of retry attempts.
   */
  maxAttempts?: number

  /**
   * An optional observer for monitoring retry events.
   */
  observer?: RetryObserver
}
