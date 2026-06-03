import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export interface RenderedSymbolJsDoc {
  target: SymbolIdentity
  jsDoc: string | undefined
  startOffset: number
  endOffset: number
}
