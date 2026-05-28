/**
 * Represents an analyzed import declaration.
 */
export interface ImportAnalysis {
  /**
   * Raw module specifier text.
   *
   * Example:
   * './userRepository'
   */
  moduleSpecifier: string

  /**
   * Whether the import is type-only.
   */
  isTypeOnly: boolean

  /**
   * Named imported symbols.
   */
  importedSymbols: Array<string>

  /**
   * Namespace import identifier.
   *
   * Example:
   * import * as fs from 'node:fs'
   */
  namespaceImport?: string

  /**
   * Default import identifier.
   */
  defaultImport?: string
}
