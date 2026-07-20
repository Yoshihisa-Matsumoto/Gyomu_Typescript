import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export type FileUpdatePlan = {
  edits: Array<{
    symbol: SymbolIdentity
    startLine: number
    endLine: number
    startOffset: number
    endOffset: number
    newText: string
    indent: number

    declarationOrder: number
  }>
}
