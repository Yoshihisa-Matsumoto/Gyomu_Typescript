/**
 * Represents the execution context for JSDoc updates, containing metadata about the file and the specific symbol being processed.
 */
export interface ModeContext {
  /**
   * Metadata concerning the file being processed.
   */
  file: {
    /**
     * The default generation mode for the file.
     */
    defaultMode: 'light' | 'deep'

    /**
     * Indicates whether the file contains generated JSDoc.
     */
    hasGeneratedJsDoc: boolean

    /**
     * The stability score of the file.
     */
    stabilityScore: number
  }

  /**
   * Metadata concerning the specific symbol being processed.
   */
  symbol: {
    /**
     * Indicates whether the symbol is exported.
     */
    exported: boolean

    /**
     * Indicates whether the symbol is part of the public API.
     */
    publicApi: boolean

    /**
     * Indicates whether the symbol currently has JSDoc documentation.
     */
    hasJsDoc: boolean

    /**
     * Indicates whether the symbol has been manually edited by a human.
     */
    humanEdited: boolean

    /**
     * The complexity score of the symbol.
     */
    complexityScore: number
  }
}
