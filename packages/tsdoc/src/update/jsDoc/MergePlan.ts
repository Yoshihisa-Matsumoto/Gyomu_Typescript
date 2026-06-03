import type { JsDocTarget } from '@gyomu/ai-compiler/jsdoc-update'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

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

export interface MergePlan {
  target: SymbolIdentity
  summary: MergeActionContext<string>
  params: Array<{
    name: string
    sortOrder: number
    action: MergeActionContext<ParamAction>
    conflict?: ConflictType
  }>
  returns: MergeActionContext<string>

  tags: Array<{
    tag: JsDocTarget
    sortOrder: number
    action: MergeActionContext<string>
    conflict?: ConflictType
  }>

  // 重要追加
  conflicts: Array<{
    symbol: string
    type: ConflictType
    message: string
  }>

  confidence: number // 0-1（AI更新の安全度）
  averageConfidence: number // summary/params/returns/tagsの平均信頼度
}

export type ParamAction = {
  type?: string
  description?: string
}
