import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import type { UpdatedJsDoc } from './UpdatedJsDoc.js'

export interface UpdatedSymbolJsDoc {
  target: SymbolIdentity
  indent: string
  jsDoc: UpdatedJsDoc
}
