import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { UpdatedJsDoc } from './UpdatedJsDoc.js'

/**
 * Represents a planned update for a symbol's JSDoc, including the target identifier, indentation settings, and the updated JSDoc content.
 */
export interface UpdatedSymbolJsDoc {
  /**
   * The identifier of the symbol being updated.
   */
  target: SymbolIdentity

  /**
   * The whitespace indentation string used for formatting the generated JSDoc.
   */
  indent: string

  /**
   * The complete structured JSDoc update content.
   */
  jsDoc: UpdatedJsDoc
}
