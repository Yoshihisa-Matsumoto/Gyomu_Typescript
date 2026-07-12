import { findExportSymbol } from '@gyomu/ts-analysis'
import type { FileConceptInput } from '@gyomu/ai-compiler/file-summary'
import type {
  ExportAnalysis,
  ImportAnalysis,
  ImportedSymbolDependency,
} from '@gyomu/schema/schemas/typescript'
import type { DependencySummary, ExportSummary } from '@gyomu/schema/concept'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'

export const buildFilConceptInput = (context: FileAnalysisContext): FileConceptInput => {
  return {
    path: context.analysis.path,
    exports: context.analysis.exports
      .map((ex) => buildExportSummary(context, ex))
      .filter((ex2) => !!ex2),
    // externalDependencies: aggregateDependencies(context),
    // symbols: context.analysis.symbols.map((s) => buildSymbolSummary(context, s)),
  }
}

const buildExportSummary = (
  context: FileAnalysisContext,
  exportItem: ExportAnalysis,
): ExportSummary | undefined => {
  if (exportItem.kind == 'local') {
    const symbol = findExportSymbol(context, exportItem)
    return {
      kind: symbol.kind,
      summary: symbol.jsDoc?.hasSummary ? (symbol.parsedJsDoc?.[0]?.summary ?? '') : '',
      symbol: symbol.identity.symbolId,
    }
  } else {
    return undefined
  }
}

export const aggregateDependencies = (context: FileAnalysisContext): Array<string> => {
  const dependencies: ReadonlyArray<ImportedSymbolDependency> = context.analysis.symbols
    .map((symbol) => symbol.dependencyCandidates)
    .flat()
    .map((c) => c.target)
    .filter((c) => c.scope == 'import')
  const map = new Map<string, DependencySummary>()
  dependencies.forEach((d) => {
    const summary = buildDependencySummary(d, context.analysis.imports)
    if (summary) map.set(`${summary.target}:${summary.external}`, summary)
  })
  return [...map.values().map((d) => d.target)]
}

const buildDependencySummary = (
  candidate: ImportedSymbolDependency,
  imported: ReadonlyArray<ImportAnalysis>,
): DependencySummary | undefined => {
  const targetImport = imported.find((i) => i.localName == candidate.localSymbolName)
  if (targetImport) {
    return {
      target: candidate.localSymbolName,
      external: !targetImport.moduleSpecifier.startsWith('.'),
    }
  }
  return undefined
}

// const buildSymbolSummary = (
//   context: FileAnalysisContext,
//   symbol: SymbolAnalysis,
// ): SymbolSummary => {
//   return {
//     kind: symbol.kind,
//     summary: symbol.jsDoc?.hasSummary ? (symbol.parsedJsDoc?.[0]?.summary ?? '') : '',
//     name: symbol.identity.symbolId,
//   }
// }
