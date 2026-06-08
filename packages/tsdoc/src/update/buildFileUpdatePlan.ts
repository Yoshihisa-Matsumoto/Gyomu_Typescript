import { toIdentityKey } from '../analysis/symbol/SymbolAnalysis.js'
import type { RenderedSymbolJsDoc } from './jsdoc/RenderedSymbolJsDoc.js'
import type { FileAnalysisResult } from '../analysis/file/FileAnalysisResult.js'
import type { FileUpdatePlan } from './jsdoc/FileUpdatePlan.js'

export const buildFileUpdatePlan = (
  sourceFile: FileAnalysisResult,
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
    })),
  }
}
