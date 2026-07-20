import { isSymbolKind, toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { AnalysisError } from '../error/AnalysisError.js'
import type { LocalExportAnalysis, SymbolAnalysis } from '@gyomu/schema/schemas/typescript'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'

export const findExportSymbol = (
  context: FileAnalysisContext,
  exportItem: LocalExportAnalysis,
): SymbolAnalysis => {
  const id = toIdentityKey(exportItem.identity)

  const symbol = context.metadata.symbols.get(id)
  if (symbol && isSymbolKind(symbol.analysis.kind)) return symbol.analysis as SymbolAnalysis

  throw new AnalysisError({
    cause: undefined,
    filePath: context.analysis.path,
    phase: 'post-analysis' as const,
    message: 'Export Symbol Not found',
    details: id,
  })
}
