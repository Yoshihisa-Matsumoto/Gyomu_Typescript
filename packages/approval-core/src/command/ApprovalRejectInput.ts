import type { UserId } from '@gyomu/schema'
import type { ApprovalRequestId } from '../model/ApprovalRequest.js'

export interface ApprovalRejectInput {
  readonly requestId: ApprovalRequestId

  readonly rejectedBy: UserId

  readonly reason?: string
}
