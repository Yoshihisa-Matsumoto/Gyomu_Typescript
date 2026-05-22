import type { JsonValue, UserId } from '@gyomu/schema'
import type { ApprovalRequestId } from '../model/ApprovalRequest.js'

export interface ApprovalApproveInput {
  readonly requestId: ApprovalRequestId

  readonly approvedBy: UserId

  readonly response?: JsonValue

  readonly reason?: string
}
