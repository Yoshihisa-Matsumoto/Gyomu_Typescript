import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import type { UpdatedJsDoc } from './UpdatedJsDoc.js'

export interface UpdatedSymbolJsDoc {
  target: SymbolIdentity
  jsDoc: UpdatedJsDoc
}
