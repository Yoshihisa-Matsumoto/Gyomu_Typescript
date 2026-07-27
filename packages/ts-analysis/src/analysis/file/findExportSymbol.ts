import { isSymbolKind, toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { AnalysisError } from '../error/AnalysisError.js'
import type { LocalExportAnalysis, SymbolAnalysis } from '@gyomu/schema/schemas/typescript'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'

/**
 * Locates the symbol analysis for a given exported item within the provided file analysis context.
 *
 * @param context The current file analysis context.
 *
 * @param exportItem The export analysis item to find.
 *
 * @returns The found symbol analysis.
 */
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
