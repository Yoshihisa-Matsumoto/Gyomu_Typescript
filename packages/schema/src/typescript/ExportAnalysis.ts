import type { SymbolAnalysis } from './SymbolAnalysis.js'

/**
 * Represents an exported symbol declaration.
 */
export interface ExportAnalysis {
  /**
   * Exported name.
   *
   * This may differ from symbol.name when alias export is used.
   */
  exportedName: string

  /**
   * Symbol declaration.
   */
  symbol: SymbolAnalysis

  /**
   * Whether the symbol is exported as default.
   */
  isDefault: boolean

  /**
   * Whether the export is type-only.
   */
  isTypeOnly: boolean
}
