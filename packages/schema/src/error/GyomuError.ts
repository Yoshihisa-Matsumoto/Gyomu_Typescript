import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import { AccessError } from './AccessError.js'
import { ConfigError } from './ConfigError.js'
import { AiError } from './AiError.js'
import { DBError } from './DBError.js'
import { IOError } from './IOError.js'
import { NetworkError } from './NetworkError.js'
import type { AppErrorContext } from './BaseError.js'

/**
 * Defines the error context for Gyomu operations, including the operation name, domain, specific reason for failure, and an optional retryability indicator.
 */
export interface GyomuErrorContext extends AppErrorContext {
  /**
   * The name of the operation where the error occurred.
   */
  readonly operation: string // fetchHoliday

  /**
   * The functional domain of the error (e.g., market, file, ai).
   */
  readonly domain: string // market / file / ai

  /**
   * The categorical reason for the error occurrence.
   */
  readonly reason:
    | 'invalid_input'
    | 'not_found'
    | 'external_failure'
    | 'unexpected'
    | 'concurrent_modification'
    | 'out_of_bounds'

  /**
   * Indicates whether the operation might succeed if retried.
   */
  readonly retryable?: boolean
}

const isAccessError = (e: unknown) => e instanceof AccessError
const isConfigError = (e: unknown) => e instanceof ConfigError
const isNetworkError = (e: unknown) => e instanceof NetworkError
const isIOError = (e: unknown) => e instanceof IOError
const isAIError = (e: unknown) => e instanceof AiError
const isDBError = (e: unknown) => e instanceof DBError

/**
 * Maps an arbitrary error to a specific GyomuError reason based on error type.
 *
 * @param e The caught error object.
 *
 * @returns The corresponding reason category.
 */
export const mapGyomuReason = (e: unknown): GyomuErrorContext['reason'] => {
  if (isAccessError(e)) return 'invalid_input'
  if (isConfigError(e)) return 'external_failure'
  if (isNetworkError(e)) return 'external_failure'
  if (isIOError(e)) return 'external_failure'
  if (isAIError(e)) return 'external_failure'
  if (isDBError(e)) return 'external_failure'

  return 'unexpected'
}

/**
 * A tagged error class for Gyomu domain errors, incorporating specific error traits and the GyomuErrorContext.
 */
export class GyomuError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/GyomuError')<GyomuErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable ?? false
    },
  },
) {}

/**
 * Creates a factory that generates a GyomuError with a reason of 'external_failure'.
 *
 * @param operation The name of the failing operation.
 *
 * @param domain The domain in which the failure occurred.
 *
 * @returns A function that accepts an error object and returns a new GyomuError instance.
 */
export const gyomuExternalFailure = (operation: string, domain: string) => (e: unknown) =>
  new GyomuError({
    message: `${operation} failed`,
    operation,
    domain,
    reason: 'external_failure',
    cause: e,
  })
