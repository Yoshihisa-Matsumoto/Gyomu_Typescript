import type { Effect } from 'effect'
import type { ApprovalRequest, ApprovalRequestId } from '../model/ApprovalRequest.js'

export interface ApprovalRequester {
  createRequest: (request: ApprovalRequest) => Effect.Effect<ApprovalRequestId>
}
