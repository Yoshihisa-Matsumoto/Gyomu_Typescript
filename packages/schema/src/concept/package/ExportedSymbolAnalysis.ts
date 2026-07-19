import type { ProjectRelativePath } from '../../typescript/types.js'
import type { SymbolKind } from '../../schemas/typescript/SymbolKind.js'
import type { ExportSummary } from '../FileSummary.js'

/**
 * Represents the structural analysis of an exported symbol, including its name, kind, origin, and documentation summary.
 */
export interface ExportedSymbolAnalysis {
  /**
   * Public symbol name.
   */
  name: string

  /**
   * Symbol kind.
   */
  kind: SymbolKind

  /**
   * File containing the declaration.
   */
  sourceFile: ProjectRelativePath

  /**
   * Summary of the symbol.
   */
  summary: ExportSummary
}
