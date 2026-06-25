import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

/**
 * Defines the error context for access-related failures, including the resource identifier and the specific reason for the access denial.
 */
export interface AccessErrorContext extends AppErrorContext {
  /**
   * The identifier of the resource associated with the error.
   */
  readonly resource: string // fileName

  /**
   * The underlying cause of the access failure.
   */
  readonly reason: 'in_use' | 'locked' | 'permission_denied' | 'not_exist' | 'invalid'
}

/**
 * Represents an error that occurs during resource access operations.
 */
export class AccessError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/AccessError')<AccessErrorContext>,
) {}
