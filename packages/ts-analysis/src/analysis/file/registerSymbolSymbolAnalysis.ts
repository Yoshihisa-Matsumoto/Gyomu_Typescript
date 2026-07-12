import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { registerSymbolSymbolAnalysisInternal } from '../buildIndex.js'
import type {
  DocumentableMemberAnalysis,
  DocumentableTypeProperty,
  IndexSignatureAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { AnalysisOptions } from '../AnalysisOption.js'
import type { FileAnalysisMetadata } from '@gyomu/schema/typescript'

export const registerSymbolSymbolAnalysis = (
  metadata: FileAnalysisMetadata,
  symbolAnalysis:
    DocumentableMemberAnalysis | SymbolAnalysis | DocumentableTypeProperty | IndexSignatureAnalysis,
  option: AnalysisOptions | undefined,
) => {
  if (option?.verifyIndex) {
    const id = toIdentityKey(symbolAnalysis.identity)
    if (
      id ==
      'CrudRepository::type::$member.synchronizeRecords.$return.$member.insertedRows::property:%%:property'
    )
      throw new Error('HERE!!')
    if (!metadata.symbols.has(id)) metadata.symbols.set(id, { analysis: symbolAnalysis })
    registerSymbolSymbolAnalysisInternal(metadata, symbolAnalysis)
  }
}
