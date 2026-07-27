import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

/**
 * Defines the distinct phases of the TSDoc update process.
 */
export type UpdatePhase = 'context-build' | 'update-plan' | 'merge-plan' | 'apply-merge' | 'update'

/**
 * Contextual information for errors occurring during the TSDoc update process.
 */
export interface UpdateErrorContext extends AppErrorContext {
  /**
   * Target file path being updated.
   */
  readonly filePath: string

  /**
   * Update phase where the error occurred.
   */
  readonly phase: UpdatePhase

  /**
   * Optional symbol being processed.
   */
  readonly symbolId?: string
}

/**
 * Represents an error encountered during a TSDoc update operation.
 */
export class UpdateError extends withErrorTraits(
  Data.TaggedError('@gyomu/agent/tsdoc/UpdateError')<UpdateErrorContext>,
) {}
