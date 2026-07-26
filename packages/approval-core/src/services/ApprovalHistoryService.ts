import { Context } from 'effect'
import type { UserId } from '@gyomu/schema'
import type { Effect } from 'effect/Effect'
import type { ApprovalRecord } from '../model/ApprovalRecord.js'

/**
 * Provides functionality to retrieve approval history records for users and specific tools.
 */
export interface ApprovalHistoryService {
  /**
   * Retrieves the approval history for a given user.
   *
   * @param userId The unique identifier of the user.
   *
   * @returns An Effect containing the collection of approval records for the specified user.
   */
  findByUser: (userId: UserId) => Effect<ReadonlyArray<ApprovalRecord>>

  /**
   * Retrieves the recent approval history for a specific tool.
   *
   * @param toolName The name of the tool to filter by.
   *
   * @returns An Effect containing the collection of recent approval records associated with the specified tool.
   */
  findRecentByTool: (toolName: string) => Effect<ReadonlyArray<ApprovalRecord>>
}

/**
 * A service definition for accessing approval history.
 */
export class ApprovalHistory extends Context.Service<ApprovalHistory, ApprovalHistoryService>()(
  'ApprovalHistory',
) {}
