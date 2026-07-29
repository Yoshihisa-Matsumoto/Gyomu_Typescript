import type { Effect } from 'effect'
import type { ApprovalApproveInput } from '../command/ApprovalApproveInput.js'
import type { ApprovalRejectInput } from '../command/ApprovalRejectInput.js'
import type { ApprovalRequestId } from '../model/ApprovalRequest.js'
import type { ApprovalStatus } from '../model/ApprovalStatus.js'

/**
 * Defines the interface for managing and retrieving approval request statuses.
 */
export interface ApprovalStore {
  /**
   * Retrieves the current status of an approval request by its ID.
   *
   * @param id The unique identifier of the approval request.
   *
   * @returns An Effect that resolves to the current ApprovalStatus.
   */
  get: (id: ApprovalRequestId) => Effect.Effect<ApprovalStatus>

  /**
   * Approves an approval request using the provided input details.
   *
   * @param args The input data required to perform the approval.
   *
   * @returns An Effect that completes when the approval is successful.
   */
  approve: (args: ApprovalApproveInput) => Effect.Effect<void>

  /**
   * Rejects an approval request using the provided input details.
   *
   * @param args The input data required to perform the rejection.
   *
   * @returns An Effect that completes when the rejection is successful.
   */
  reject: (args: ApprovalRejectInput) => Effect.Effect<void>
}
