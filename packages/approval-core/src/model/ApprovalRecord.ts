import type { JsonValue, UserId } from '@gyomu/schema'
import type { ApprovalRequestId } from './ApprovalRequest.js'

/**
 * Represents an individual event or action within the approval workflow.
 */
export interface ApprovalRecord {
  /**
   * The unique identifier of the approval request this record belongs to.
   */
  readonly requestId: ApprovalRequestId

  /**
   * The user who performed the action.
   */
  readonly actor: UserId

  /**
   * The type of action performed in this record.
   */
  readonly action: 'requested' | 'approved' | 'rejected'

  /**
   * An optional explanation or reason provided for the action.
   */
  readonly reason?: string

  /**
   * Optional structured response data associated with the action.
   */
  readonly response?: JsonValue

  /**
   * The communication channel through which the action occurred.
   */
  readonly channel?: 'ui' | 'email' | 'slack' | 'api'

  /**
   * The timestamp when the action occurred.
   */
  readonly occurredAt: Date
}
