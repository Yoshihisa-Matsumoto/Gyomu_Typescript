import { toIdentityKey } from '../symbol/SymbolAnalysis.js'
import type { SymbolAnalysis } from '../symbol/SymbolAnalysis.js'
import type { DocumentableMemberAnalysis } from '../symbol/MemberAnalysis.js'
import type { FileAnalysisMetadata } from './FileAnalysisResult.js'

export const registerSymbolSymbolAnalysis = (
  metadata: FileAnalysisMetadata,
  symbolAnalysis: DocumentableMemberAnalysis | SymbolAnalysis,
  indent: string,
) => {
  const id = toIdentityKey(symbolAnalysis.identity)
  if (!metadata.symbols.has(id)) metadata.symbols.set(id, { analysis: symbolAnalysis, indent })
}
