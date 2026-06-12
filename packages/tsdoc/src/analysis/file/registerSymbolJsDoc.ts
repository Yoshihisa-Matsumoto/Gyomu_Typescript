import { AnalysisError } from '../error/AnalysisError.js'
import type { ExtractedJsDoc } from '../jsdoc/JsDocAnalysis.js'
import type { ParsedJsDoc } from '@gyomu/schema/typescript'
import type { SymbolId } from '../types.js'
import type { FileAnalysisMetadata } from './FileAnalysisResult.js'

export const registerSymbolJsDoc = (
  symbolId: SymbolId,
  metadata: FileAnalysisMetadata,
  extractedjsDoc?: ExtractedJsDoc,
) => {
  if (extractedjsDoc) {
    const parsed: ParsedJsDoc | undefined = extractedjsDoc.parsed[0]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (extractedjsDoc.parsed.length !== 1 || !parsed) {
      throw new AnalysisError({
        message: `Multiple JSDoc comments found for symbol ${symbolId}. This is not supported.`,
        cause: undefined,
        details: extractedjsDoc,
        filePath: symbolId,
        phase: 'jsdoc-extract',
      })
    }

    if (!metadata.parsedJsDocs.has(symbolId)) metadata.parsedJsDocs.set(symbolId, parsed)
  }
}
