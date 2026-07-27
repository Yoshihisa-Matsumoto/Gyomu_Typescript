import type { JsDocTarget, ParamActionValue } from '@gyomu/ai-compiler/jsdoc-update'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

/**
 * Defines a union of actions for merging documentation, allowing for replacement, deletion, or preservation of content.
 */
export type MergeActionContext<T> =
  | {
      type: 'replace'
      value: T
    }
  | {
      type: 'delete'
    }
  | {
      type: 'preserve'
    }

type ConflictType = 'human-edited' | 'missing-in-new' | 'structural-mismatch'

/**
 * Defines a plan for merging documentation updates, containing the target symbol, proposed actions for different sections, potential conflicts, and confidence metrics.
 */
export interface MergePlan {
  /**
   * The target symbol identifier for which the plan applies.
   */
  target: SymbolIdentity

  /**
   * The merge action to be applied to the summary section.
   */
  summary: MergeActionContext<string>

  /**
   * The list of parameter update actions.
   */
  params: Array<{
    name: string
    sortOrder: number
    action: MergeActionContext<ParamActionValue>
    conflict?: ConflictType
  }>

  /**
   * The merge action to be applied to the return documentation.
   */
  returns: MergeActionContext<string>

  /**
   * The list of JSDoc tag update actions.
   */
  tags: Array<{
    tag: JsDocTarget
    sortOrder: number
    action: MergeActionContext<string>
    conflict?: ConflictType
  }>

  // 重要追加

  /**
   * A collection of conflicts detected during the merge process.
   */
  conflicts: Array<{
    symbol: string
    type: ConflictType
    message: string
  }>

  /**
   * The overall safety confidence score (0 to 1) for this update plan.
   */
  confidence: number // 0-1（AI更新の安全度）

  /**
   * The average confidence score calculated across all sections of the plan.
   */
  averageConfidence: number // summary/params/returns/tagsの平均信頼度
}

/**
 * Represents the structure of a parameter update, containing optional type information and a descriptive string.
 */
export type ParamAction = {
  type?: string
  description?: string
}
