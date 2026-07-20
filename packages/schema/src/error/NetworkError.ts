import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

/**
 * Defines the specific type of network operation that triggered the error.
 */
export type NetworkOperation = 'upload' | 'download' | 'connect' | 'request'

/**
 * Contextual information for a network-related error, including the operation performed, target endpoint, and retry capability.
 */
export interface NetworkErrorContext extends AppErrorContext {
  /**
   * The specific network operation attempted.
   */
  readonly operation: NetworkOperation

  /**
   * The target endpoint URL or path associated with the operation.
   */
  readonly endpoint?: string // 例: ftp://host/path

  /**
   * Indicates whether the network operation can be safely retried.
   */
  readonly retryable: boolean // 通信系はここで判断できると強い
}

/**
 * Checks if an error is considered retryable based on its message content.
 *
 * @param e The error object to inspect.
 *
 * @returns True if the error indicates a retryable network condition, false otherwise.
 */
export const isRetryableNetworkError = (e: unknown): boolean => {
  if (!(e instanceof Error)) return false

  const msg = e.message.toLowerCase()

  return (
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('temporarily') ||
    msg.includes('network')
  )
}

/**
 * A tagged error representing failures in network operations.
 */
export class NetworkError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/NetworkError')<NetworkErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable
    },
  },
) {}
