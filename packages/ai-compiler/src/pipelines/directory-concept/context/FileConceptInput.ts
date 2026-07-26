import type { ExportSummary, ReExportSummary } from '@gyomu/schema/concept'
import type { SymbolKind } from '@gyomu/schema/schemas/typescript'

/**
 * Represents the structural information extracted from a source file, including its path, exported declarations, and re-exported members.
 */
export interface FileConceptInput {
  /**
   * The absolute or relative file system path of the source file.
   */
  path: string

  /**
   * A collection of summaries for all exported members found within the file.
   */
  exports: Array<ExportSummary>

  /**
   * A collection of summaries for all members re-exported from other modules.
   */
  reExports: Array<ReExportSummary>

  // symbols: Array<SymbolSummary>

  // externalDependencies: Array<string>
}

/**
 * Provides a summary of a specific code symbol, including its name, kind, and an optional description.
 */
export interface SymbolSummary {
  /**
   * The identifier name of the symbol.
   */
  name: string

  /**
   * The type or category of the symbol.
   */
  kind: SymbolKind

  /**
   * An optional textual summary describing the symbol's purpose.
   */
  summary?: string
}
