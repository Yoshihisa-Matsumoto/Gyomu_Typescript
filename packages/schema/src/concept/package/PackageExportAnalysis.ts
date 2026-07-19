import type { ExportedSymbolAnalysis } from './ExportedSymbolAnalysis.js'

/**
 * Represents an analysis of the package exports, including the export path and the symbols exported from the associated source file.
 */
export interface PackageExportAnalysis {
  /**
   * Export path (".", "./schema", etc.)
   */
  exportPath: string

  /**
   * Public symbols exported from the source file.
   */
  exportedSymbols: ReadonlyArray<ExportedSymbolAnalysis>
}
