import type { JsonValue, UserId } from '@gyomu/schema'
import type { ApprovalStatus } from './ApprovalStatus.js'
import type { ApprovalChallenge } from './ApprovalChallenge.js'

export type ApprovalRequestId = string
export interface ApprovalRequest {
  readonly id: ApprovalRequestId

  readonly status: ApprovalStatus

  readonly createdAt: Date

  readonly requestedBy: UserId

  readonly approvedBy?: UserId

  readonly challenge: ApprovalChallenge

  readonly payload: JsonValue // Tool 入力パラメータ
}
