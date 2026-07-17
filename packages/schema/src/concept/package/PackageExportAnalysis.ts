import type { ExportedSymbolAnalysis } from './ExportedSymbolAnalysis.js'

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
