import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

/**
 * Defines a plan for updating a source file, containing a collection of text edits.
 */
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
