import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { TsDocSymbolContext } from './TsDocSymbolContext.js'

/**
 * Represents the context for a file undergoing JSDoc updates, including project configuration, source location, and the symbols to be documented.
 */
export interface TsDocFileContext {
  /**
   * Project metadata associated with the context.
   */
  project: {
    /**
     * The name of the project being processed.
     */
    name: string
  }

  /**
   * Source file location metadata.
   */
  source: {
    /**
     * The relative path of the source file from the project root.
     */
    relativePath: string
  }

  /**
   * List of symbol contexts to process for documentation updates.
   */
  symbols: Array<TsDocSymbolContext>

  /**
   * Optional retry configuration for processing specific symbols.
   */
  retry?: {
    /**
     * The current retry attempt number.
     */
    attempt: number

    /**
     * A collection of symbol identities that require documentation or updates.
     */
    missingSymboldentity: Array<SymbolIdentity>
  }
}
