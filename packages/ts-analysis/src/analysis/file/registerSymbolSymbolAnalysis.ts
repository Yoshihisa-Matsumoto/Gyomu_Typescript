import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import type {
  DocumentableMemberAnalysis,
  DocumentableTypeProperty,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { FileAnalysisMetadata } from './FileAnalysisResult.js'

export const registerSymbolSymbolAnalysis = (
  metadata: FileAnalysisMetadata,
  symbolAnalysis: DocumentableMemberAnalysis | SymbolAnalysis | DocumentableTypeProperty,
) => {
  const id = toIdentityKey(symbolAnalysis.identity)
  if (
    id ==
    'CrudRepository::type::$member.synchronizeRecords.$return.$member.insertedRows::property:%%:property'
  )
    throw new Error('HERE!!')
  if (!metadata.symbols.has(id)) metadata.symbols.set(id, { analysis: symbolAnalysis })
}
