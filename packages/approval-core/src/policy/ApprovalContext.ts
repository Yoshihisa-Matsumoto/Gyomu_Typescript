import type { UserId } from '@gyomu/schema'

/**
 * Represents the execution context for an approval process, encapsulating the requested action, the actor performing it, and associated input data and metadata.
 */
export interface ApprovalContext<TInput = unknown, TMetadata = unknown> {
  /**
   * The identifier of the action being requested.
   */
  readonly action: string

  /**
   * The identifier of the actor requesting or performing the action.
   */
  readonly actor: UserId

  /**
   * The input data associated with the action.
   */
  readonly input: TInput

  /**
   * Arbitrary metadata associated with the action.
   */
  readonly metadata: TMetadata
}
