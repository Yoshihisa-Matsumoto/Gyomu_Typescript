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
   * The type of import, categorized as named, default, or namespace.
   */
  kind: 'named' | 'default' | 'namespace'

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
