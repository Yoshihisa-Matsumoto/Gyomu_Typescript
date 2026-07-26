/**
 * Represents the execution context for JSDoc updates, containing file-level configuration and symbol-specific metadata.
 */
export interface ModeContext {
  /**
   * Configuration and metrics for the target file.
   */
  file: {
    /**
     * The default update mode ('light' or 'deep') for the file.
     */
    defaultMode: 'light' | 'deep'

    /**
     * Indicates whether the file already contains machine-generated JSDoc.
     */
    hasGeneratedJsDoc: boolean

    /**
     * The stability score assigned to the file.
     */
    stabilityScore: number
  }

  /**
   * Metrics and status information for the symbol currently being processed.
   */
  symbol: {
    /**
     * Whether the symbol is exported from the module.
     */
    exported: boolean

    /**
     * Whether the symbol is considered part of the public API.
     */
    publicApi: boolean

    /**
     * Whether the symbol currently has JSDoc documentation.
     */
    hasJsDoc: boolean

    /**
     * Whether the symbol's documentation has been manually edited by a human.
     */
    humanEdited: boolean

    /**
     * The cyclomatic complexity or similar metric score for the symbol.
     */
    complexityScore: number
  }
}
