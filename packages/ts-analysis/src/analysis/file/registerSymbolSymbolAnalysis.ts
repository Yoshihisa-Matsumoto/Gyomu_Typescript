import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import type {
  DocumentableMemberAnalysis,
  DocumentableTypeProperty,
  IndexSignatureAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { FileAnalysisMetadata } from './FileAnalysisResult.js'

export const registerSymbolSymbolAnalysis = (
  metadata: FileAnalysisMetadata,
  symbolAnalysis:
    DocumentableMemberAnalysis | SymbolAnalysis | DocumentableTypeProperty | IndexSignatureAnalysis,
) => {
  const id = toIdentityKey(symbolAnalysis.identity)
  if (
    id ==
    'CrudRepository::type::$member.synchronizeRecords.$return.$member.insertedRows::property:%%:property'
  )
    throw new Error('HERE!!')
  if (!metadata.symbols.has(id)) metadata.symbols.set(id, { analysis: symbolAnalysis })
}
