import type { SymbolAnalysis } from './SymbolAnalysis.js'

/**
 * Represents an exported symbol declaration.
 */
export interface ExportAnalysis {
  /**
   * The exported name. This may differ from the original symbol name when an alias is used.
   */
  exportedName: string

  /**
   * The underlying symbol declaration.
   */
  symbol: SymbolAnalysis

  /**
   * Indicates if the symbol is exported as a default export.
   */
  isDefault: boolean

  /**
   * Indicates if the export is type-only.
   */
  isTypeOnly: boolean
}
