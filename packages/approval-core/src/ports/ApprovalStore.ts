import type { Effect } from 'effect'
import type { ApprovalApproveInput } from '../command/ApprovalApproveInput.js'
import type { ApprovalRejectInput } from '../command/ApprovalRejectInput.js'
import type { ApprovalRequestId } from '../model/ApprovalRequest.js'
import type { ApprovalStatus } from '../model/ApprovalStatus.js'

export interface ApprovalStore {
  get: (id: ApprovalRequestId) => Effect.Effect<ApprovalStatus>

  approve: (args: ApprovalApproveInput) => Effect.Effect<void>

  reject: (args: ApprovalRejectInput) => Effect.Effect<void>
}
