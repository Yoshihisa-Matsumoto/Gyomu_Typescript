import type { SymbolId } from '@gyomu/schema/typescript'

/**
 * Represents a composite symbol identifier, combining a unique SymbolId and its qualified name.
 */
export interface SymbolIDComposite {
  /**
   * The unique symbol identifier.
   */
  id: SymbolId

  /**
   * The fully qualified string name of the symbol.
   */
  qualifiedName: string
}
