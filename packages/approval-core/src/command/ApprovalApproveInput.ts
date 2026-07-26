import type { JsonValue, UserId } from '@gyomu/schema'
import type { ApprovalRequestId } from '../model/ApprovalRequest.js'

/**
 * Defines the input parameters for approving an approval request, including the request ID, the user performing the approval, optional metadata, and a reason.
 */
export interface ApprovalApproveInput {
  /**
   * The identifier of the approval request to be approved.
   */
  readonly requestId: ApprovalRequestId

  /**
   * The identifier of the user approving the request.
   */
  readonly approvedBy: UserId

  /**
   * Optional JSON response metadata associated with the approval action.
   */
  readonly response?: JsonValue

  /**
   * An optional explanation or reason for the approval decision.
   */
  readonly reason?: string
}
