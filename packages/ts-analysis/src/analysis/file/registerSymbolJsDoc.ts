// import { AnalysisError } from '../error/AnalysisError.js'
import { AnalysisError } from '../error/AnalysisError.js'
import type { AnalysisOptions } from '../AnalysisOption.js'
import type { ExtractedJsDoc } from '../jsdoc/ExtractedJsDoc.js'
import type { FileAnalysisMetadata, SymbolId } from '@gyomu/schema/typescript'
import type { ParsedJsDoc } from '@gyomu/schema/schemas/typescript'

export const registerSymbolJsDoc = (
  symbolId: SymbolId,
  metadata: FileAnalysisMetadata,
  extractedjsDoc: ExtractedJsDoc | undefined,
  option: AnalysisOptions | undefined,
) => {
  if (option?.verifyIndex) {
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
}

// export const registerParsedJsDoc = (
//   symbolId: SymbolId,
//   metadata: FileAnalysisMetadata,
//   parsedArray: ReadonlyArray<ParsedJsDoc> | undefined,
//   option?: AnalysisOptions,
// ) => {
//   if (option?.verifyIndex) {
//     registerParsedJsDocInternal(symbolId, metadata, parsedArray)
//   }
// }
