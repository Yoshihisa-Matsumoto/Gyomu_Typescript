import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

/**
 * Represents a parsed JSDoc block associated with a specific symbol, including positional metadata.
 */
export interface RenderedSymbolJsDoc {
  /**
   * The identifier of the symbol to which this JSDoc belongs.
   */
  target: SymbolIdentity

  /**
   * The raw JSDoc content string, if present.
   */
  jsDoc: string | undefined

  /**
   * The starting character offset of the JSDoc block within the source file.
   */
  startOffset: number

  /**
   * The ending character offset of the JSDoc block within the source file.
   */
  endOffset: number

  /**
   * The indentation level of the JSDoc block.
   */
  indent: number
}
