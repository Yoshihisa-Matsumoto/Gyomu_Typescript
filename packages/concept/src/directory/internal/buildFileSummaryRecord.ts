import { findExportSymbol, normalizePath } from '@gyomu/ts-analysis'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type {
  ExportAnalysis,
  ImportAnalysis,
  ImportedSymbolDependency,
} from '@gyomu/schema/schemas/typescript'
import type {
  DependencySummary,
  ExportSummary,
  FileSummary,
  ReExportSummary,
} from '@gyomu/schema/concept'

export const buildFileSummaryRecord = (context: FileAnalysisContext): FileSummary => {
  // console.dir(context.analysis, { depth: null })
  return {
    path: ProjectRelativePath(normalizePath(context.analysis.path)),
    exports: context.analysis.exports
      .map((ex) => buildExportSummary(context, ex))
      .filter((ex2) => !!ex2),
    reExports: context.analysis.exports
      .map((ex) => buildReExportSummary(ex))
      .filter((ex2) => !!ex2),
    dependencies: aggregateDependencies(context),
  }
}

const aggregateDependencies = (context: FileAnalysisContext): Array<DependencySummary> => {
  const dependencies: ReadonlyArray<ImportedSymbolDependency> = context.analysis.symbols
    .map((symbol) => symbol.dependencyCandidates)
    .flat()
    .map((c) => c.target)
    .filter((c) => c.scope == 'import')
  // console.dir(
  //   context.analysis.symbols.map((symbol) => symbol.dependencyCandidates),
  //   { depth: null },
  // )
  // console.dir(dependencies, { depth: null })
  const map = new Map<string, DependencySummary>()
  dependencies.forEach((d) => {
    const summary = buildDependencySummary(d, context.analysis.imports)
    if (summary) map.set(`${summary.target}:${summary.external}`, summary)
  })
  // console.dir(context.analysis.imports, { depth: null })
  return [...map.values()]
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

const buildExportSummary = (
  context: FileAnalysisContext,
  exportItem: ExportAnalysis,
): ExportSummary | undefined => {
  if (exportItem.kind == 'local') {
    const symbol = findExportSymbol(context, exportItem)
    return {
      kind: symbol.kind,
      summary: symbol.jsDoc?.hasSummary
        ? (symbol.parsedJsDoc?.[0]?.summary ?? '')
        : symbol.type?.source == 'effect-schema'
          ? symbol.type.structure?.kind == 'object'
            ? (symbol.type.structure.annotations?.description ?? '')
            : ''
          : '',
      symbol: symbol.identity.symbolId,
    }
  } else return undefined
}

const buildReExportSummary = (exportItem: ExportAnalysis): ReExportSummary | undefined => {
  if (exportItem.kind == 're-export') {
    if (exportItem.exportAll) return { exportAll: true, module: exportItem.moduleSpecifier }
    return {
      exportAll: false,
      module: exportItem.moduleSpecifier,
      symbol: exportItem.exportedName ?? '',
    }
  }
}
