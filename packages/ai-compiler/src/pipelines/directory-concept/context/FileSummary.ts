import type { DependencySummary } from '@gyomu/schema/typescript'

export interface FileSummary {
  path: string
  summary: string

  exports: Array<ExportSummary>

  dependencies: Array<DependencySummary>
}

export interface ExportSummary {
  symbol: string

  kind: 'class' | 'interface' | 'function' | 'type' | 'const'

  summary: string
}
