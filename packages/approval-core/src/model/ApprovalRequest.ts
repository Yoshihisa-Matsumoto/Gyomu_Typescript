import type { JsonValue, UserId } from '@gyomu/schema'
import type { ApprovalStatus } from './ApprovalStatus.js'
import type { ApprovalChallenge } from './ApprovalChallenge.js'

/**
 * Represents the unique identifier for an approval request.
 */
export type ApprovalRequestId = string

/**
 * Represents an approval request, containing metadata, status, actor information, and the associated challenge payload.
 */
export interface ApprovalRequest {
  /**
   * The unique identifier of the approval request.
   */
  readonly id: ApprovalRequestId

  /**
   * The current approval process status.
   */
  readonly status: ApprovalStatus

  /**
   * The timestamp when the request was created.
   */
  readonly createdAt: Date

  /**
   * The ID of the user who submitted the request.
   */
  readonly requestedBy: UserId

  /**
   * The ID of the user who approved the request, if applicable.
   */
  readonly approvedBy?: UserId

  /**
   * The approval challenge configuration.
   */
  readonly challenge: ApprovalChallenge

  /**
   * The arbitrary data associated with the approval request.
   */
  readonly payload: JsonValue // Tool 入力パラメータ
}
