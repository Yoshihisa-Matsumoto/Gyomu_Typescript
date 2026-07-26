import type { Effect } from 'effect'
import type { ApprovalRequest, ApprovalRequestId } from '../model/ApprovalRequest.js'

/**
 * Interface defining a port for submitting approval requests.
 */
export interface ApprovalRequester {
  /**
   * Creates a new approval request.
   *
   * @param request The request details to be submitted.
   *
   * @returns An effect that resolves to the identifier of the created approval request.
   */
  createRequest: (request: ApprovalRequest) => Effect.Effect<ApprovalRequestId>
}
