import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { UpdatedJsDoc } from './UpdatedJsDoc.js'

export interface UpdatedSymbolJsDoc {
  target: SymbolIdentity
  indent: string
  jsDoc: UpdatedJsDoc
}
