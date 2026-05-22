import type { JsonValue, UserId } from '@gyomu/schema'
import type { ApprovalRequestId } from './ApprovalRequest.js'

export interface ApprovalRecord {
  readonly requestId: ApprovalRequestId

  readonly actor: UserId

  readonly action: 'requested' | 'approved' | 'rejected'

  readonly reason?: string

  readonly response?: JsonValue

  readonly channel?: 'ui' | 'email' | 'slack' | 'api'

  readonly occurredAt: Date
}
