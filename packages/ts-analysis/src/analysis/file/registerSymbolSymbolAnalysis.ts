import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { registerSymbolSymbolAnalysisInternal } from '../buildIndex.js'
import type {
  DocumentableMemberAnalysis,
  DocumentableTypeProperty,
  IndexSignatureAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { AnalysisOptions } from '@gyomu/schema'
import type { FileAnalysisMetadata } from '@gyomu/schema/typescript'

/**
 * Registers a symbol analysis within the provided file analysis metadata if verification is enabled.
 *
 * @param metadata The metadata object containing the collection of registered symbols.
 *
 * @param symbolAnalysis The specific analysis data for the symbol being registered.
 *
 * @param option Optional configuration for the registration process, including debug settings.
 */
export const registerSymbolSymbolAnalysis = (
  metadata: FileAnalysisMetadata,
  symbolAnalysis:
    DocumentableMemberAnalysis | SymbolAnalysis | DocumentableTypeProperty | IndexSignatureAnalysis,
  option: AnalysisOptions | undefined,
) => {
  if (option?.debugInfo?.verifyIndex) {
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
