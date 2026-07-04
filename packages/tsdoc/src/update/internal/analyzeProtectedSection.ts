import type { ProtectedSection } from '@gyomu/schema/schemas/typescript'
import type { FileAnalysisResult } from '@gyomu/ts-analysis'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'

export const analyzeProtectedSection = (
  fileResult: FileAnalysisResult,
): Array<{ identity: SymbolIdentity; protectedSections: Array<ProtectedSection> }> => {
  const result: Array<{ identity: SymbolIdentity; protectedSections: Array<ProtectedSection> }> = []
  for (const symbolTarget of fileResult.metadata.symbols.values()) {
    const targetSymbol = symbolTarget.analysis
    const targetIdentity = targetSymbol.identity

    const parsedJsDoc = targetSymbol.parsedJsDoc
    if (!parsedJsDoc) continue
    const protectedSection = parsedJsDoc
      .filter((p) => p.protectedSections.length > 0)
      .map((p) => p.protectedSections)
      .flat()
    if (protectedSection.length == 0) continue

    result.push({ identity: targetIdentity, protectedSections: protectedSection })
  }

  return result
}
