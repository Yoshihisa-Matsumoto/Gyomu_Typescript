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
   * Named imported symbols.
   */
  namedImports: Array<ImportedSymbolAnalysis>

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

export interface ImportedSymbolAnalysis {
  readonly importedName: string

  readonly localName: string

  readonly isTypeOnly: boolean
}
