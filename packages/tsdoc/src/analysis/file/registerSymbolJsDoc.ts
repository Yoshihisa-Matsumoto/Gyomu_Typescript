import type { ExtractedJsDoc } from '../jsdoc/JsDocAnalysis.js'
import type { SymbolId } from '../types.js'
import type { FileAnalysisMetadata } from './FileAnalysisResult.js'

export const registerSymbolJsDoc = (
  symbolId: SymbolId,
  metadata: FileAnalysisMetadata,
  extractedjsDoc?: ExtractedJsDoc,
) => {
  if (extractedjsDoc) {
    if (!metadata.parsedJsDocs.has(symbolId))
      metadata.parsedJsDocs.set(symbolId, extractedjsDoc.parsed)
  }
}
