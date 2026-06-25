/**
 * Represents an analyzed import declaration.
 */
export interface ImportAnalysis {
  /**
   * The raw module specifier text.
   *
   * @example
   * './userRepository'
   */
  moduleSpecifier: string

  /**
   * The list of named imported symbols.
   */
  namedImports: Array<ImportedSymbolAnalysis>

  /**
   * The identifier for the namespace import, if present.
   *
   * @example
   * import * as fs from 'node:fs'
   */
  namespaceImport?: string

  /**
   * The identifier for the default import, if present.
   */
  defaultImport?: string
}

/**
 * Represents an analyzed named imported symbol.
 */
export interface ImportedSymbolAnalysis {
  /**
   * The name of the symbol in the source module.
   */
  readonly importedName: string

  /**
   * The name of the symbol in the local scope.
   */
  readonly localName: string

  /**
   * Whether this is a type-only import.
   */
  readonly isTypeOnly: boolean
}
