import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { ProtectedSection, SymbolIdentity } from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a file analysis context to extract protected JSDoc sections associated with symbols.
 *
 * @param fileResult The file analysis context containing symbol metadata to be inspected.
 *
 * @returns An array of objects mapping symbol identities to their identified protected JSDoc sections.
 */
export const analyzeProtectedSection = (
  fileResult: FileAnalysisContext,
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
