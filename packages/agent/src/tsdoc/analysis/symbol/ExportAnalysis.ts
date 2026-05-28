import type { SymbolKind } from './SymbolModel.js'

/**
 * Represents an exported symbol declaration.
 */
export interface ExportAnalysis {
  /**
   * Exported symbol name.
   */
  name: string

  /**
   * Symbol category.
   */
  kind: SymbolKind

  /**
   * Whether the symbol is exported as default.
   */
  isDefault: boolean

  /**
   * Whether the export is type-only.
   */
  isTypeOnly: boolean
}
