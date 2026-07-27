import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { RenderedSymbolJsDoc } from './jsDoc/RenderedSymbolJsDoc.js'
import type { FileUpdatePlan } from './jsDoc/FileUpdatePlan.js'

/**
 * Creates a file update plan by sorting documentation edits based on their starting line position in the source file.
 *
 * @param sourceFile The file analysis context containing symbol metadata.
 *
 * @param updatedDocs A collection of rendered JSDoc documentation updates.
 *
 * @returns A FileUpdatePlan containing the calculated edits for the source file.
 */
export const buildFileUpdatePlan = (
  sourceFile: FileAnalysisContext,
  updatedDocs: ReadonlyArray<RenderedSymbolJsDoc>,
): FileUpdatePlan => {
  /**
   * Sort by start location desc
   */
  const targets = updatedDocs
    .flatMap((doc) => {
      const symbolData = sourceFile.metadata.symbols.get(toIdentityKey(doc.target))
      if (!symbolData) {
        console.log(`${toIdentityKey(doc.target)} Not found on symbols`)
      }
      return symbolData ? [{ symbol: symbolData.analysis, doc }] : []
    })
    .sort((a, b) => b.symbol.location.startLine - a.symbol.location.startLine)

  return {
    edits: targets.map(({ symbol, doc }) => ({
      startLine: symbol.location.startLine,
      endLine: symbol.location.endLine,
      startOffset: doc.startOffset,
      endOffset: doc.endOffset,
      symbol: symbol.identity,
      newText: doc.jsDoc ?? '',
      indent: doc.indent,
      declarationOrder: symbol.declarationOrder,
    })),
  }
}
