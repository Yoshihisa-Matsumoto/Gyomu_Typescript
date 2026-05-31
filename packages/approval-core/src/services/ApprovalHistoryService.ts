import { Context } from 'effect'
import type { UserId } from '@gyomu/schema'
import type { Effect } from 'effect/Effect'
import type { ApprovalRecord } from '../model/ApprovalRecord.js'

export interface ApprovalHistoryService {
  findByUser: (userId: UserId) => Effect<ReadonlyArray<ApprovalRecord>>

  findRecentByTool: (toolName: string) => Effect<ReadonlyArray<ApprovalRecord>>
}

export class ApprovalHistory extends Context.Service<ApprovalHistory, ApprovalHistoryService>()(
  'ApprovalHistory',
) {}
