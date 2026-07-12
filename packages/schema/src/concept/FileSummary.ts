import type { SymbolKind } from '../schemas/typescript/SymbolKind.js'
import type { ProjectRelativePath } from '../typescript/types.js'

export interface FileSummary {
  path: ProjectRelativePath

  exports: Array<ExportSummary>

  dependencies: Array<DependencySummary>
}

export interface ExportSummary {
  symbol: string

  kind: SymbolKind

  summary: string
}

export interface DependencySummary {
  target: string

  external: boolean
}
