import type { UserId } from '@gyomu/schema'
import type { ApprovalRequestId } from '../model/ApprovalRequest.js'

/**
 * Defines the input parameters required to reject an approval request, including the request identifier, the user performing the rejection, and an optional reason.
 */
export interface ApprovalRejectInput {
  /**
   * The unique identifier of the approval request being rejected.
   */
  readonly requestId: ApprovalRequestId

  /**
   * The identifier of the user who is performing the rejection.
   */
  readonly rejectedBy: UserId

  /**
   * An optional explanation or reason for the rejection.
   */
  readonly reason?: string
}
