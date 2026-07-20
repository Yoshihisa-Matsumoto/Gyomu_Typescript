import type { ExportSummary, ReExportSummary } from '@gyomu/schema/concept'
import type { SymbolKind } from '@gyomu/schema/schemas/typescript'

export interface FileConceptInput {
  path: string

  exports: Array<ExportSummary>
  reExports: Array<ReExportSummary>

  // symbols: Array<SymbolSummary>

  // externalDependencies: Array<string>
}

export interface SymbolSummary {
  name: string
  kind: SymbolKind

  summary?: string
}
