import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

export type UpdatePhase = 'context-build' | 'update-plan' | 'merge-plan' | 'apply-merge' | 'update'

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

export class UpdateError extends withErrorTraits(
  Data.TaggedError('@gyomu/agent/tsdoc/UpdateError')<UpdateErrorContext>,
) {}
