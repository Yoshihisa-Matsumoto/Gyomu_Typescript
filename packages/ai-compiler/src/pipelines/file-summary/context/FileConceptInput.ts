import type { ExportSummary } from '@gyomu/schema/concept'
import type { SymbolKind } from '@gyomu/schema/schemas/typescript'

/**
 * Defines the input structure for a file concept, containing the file path and a list of exported symbols.
 */
export interface FileConceptInput {
  /**
   * The absolute or relative path to the file.
   */
  path: string

  /**
   * A collection of summaries for symbols exported from the file.
   */
  exports: Array<ExportSummary>

  // symbols: Array<SymbolSummary>

  // externalDependencies: Array<string>
}

/**
 * Defines a summary for a code symbol, including its name, kind, and an optional descriptive summary.
 */
export interface SymbolSummary {
  /**
   * The name of the symbol.
   */
  name: string

  /**
   * The category or type of the symbol.
   */
  kind: SymbolKind

  /**
   * An optional textual summary describing the symbol's purpose.
   */
  summary?: string
}
