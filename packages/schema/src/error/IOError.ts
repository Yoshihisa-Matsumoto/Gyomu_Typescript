import { Data } from 'effect'
import { PlatformError, SystemError } from 'effect/PlatformError'
import { withOptional } from '../option.js'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

/**
 * Defines the I/O layer identifiers for system operations.
 */
export type IOLayer = 'stream' | 'filesystem' | 'csv' | 'archive'

/**
 * Defines the set of supported I/O operations.
 */
export type IOOperation = 'read' | 'write' | 'open' | 'close' | 'transform'

/**
 * Defines the context for I/O-related errors, including the affected layer, operation, target resource, and retryability.
 */
export interface IOErrorContext extends AppErrorContext {
  /**
   * The specific I/O layer where the error originated.
   */
  readonly layer: IOLayer

  /**
   * The I/O operation being performed when the error occurred.
   */
  readonly operation: IOOperation

  /**
   * The optional file name, entry name, or path involved in the I/O operation.
   */
  readonly target?: string // fileName / entryName / path

  /**
   * Indicates whether the error condition is considered retryable.
   */
  readonly retryable?: boolean

  /**
   * Optional human-readable description of why the I/O error occurred.
   */
  readonly reason?: string
}

/**
 * Represents an error that occurred during an I/O operation, encapsulating context and retryability traits.
 */
export class IOError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/IOError')<IOErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable ?? false
    },
  },
) {}

/**
 * Wraps an arbitrary error into an `IOError`, optionally augmenting the context with dynamic information.
 *
 * @param error The original error that occurred.
 *
 * @param buildContext Optional callback to generate additional error context from the original error.
 *
 * @returns An `IOError` instance wrapping the original error.
 */
export function wrapIOError(
  error: unknown,
  buildContext?: (e: unknown) => Partial<IOErrorContext>,
): IOError {
  if (error instanceof IOError) return error

  const base = (buildContext?.(error) ?? {}) as IOErrorContext

  const reason =
    error instanceof PlatformError
      ? error.reason instanceof SystemError
        ? error.reason._tag
        : undefined
      : undefined

  return new IOError({
    ...base,
    message: base.message,
    cause: error instanceof Error ? error : new Error(String(error)),
    ...withOptional({ reason }),
  })
}
