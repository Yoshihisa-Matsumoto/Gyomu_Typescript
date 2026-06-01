type MergeAction = 'replace' | 'preserve' | 'merge' | 'delete'

type ConflictType = 'human-edited' | 'missing-in-new' | 'structural-mismatch'

export interface MergePlan {
  summary: MergeAction
  params: Array<{
    name: string
    action: MergeAction
    conflict?: ConflictType
  }>
  returns: MergeAction

  tags: Array<{
    tag: string
    action: MergeAction
    conflict?: ConflictType
  }>

  // 重要追加
  conflicts: Array<{
    symbol: string
    type: ConflictType
    message: string
  }>

  confidence: number // 0-1（AI更新の安全度）
}
