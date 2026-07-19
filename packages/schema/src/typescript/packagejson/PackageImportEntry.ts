/**
 * Represents an entry in the package 'imports' field, defining the mapping from an import path to its corresponding target destination.
 */
export interface PackageImportEntry {
  /**
   * The import path pattern used as the key in the 'imports' map.
   */
  readonly importPath: string

  /**
   * The raw target mapping, which may be a direct path string or a conditional mapping object.
   */
  readonly rawTarget: string | Readonly<Record<string, string>>

  /**
   * An optional resolved target path, if applicable.
   */
  readonly sourceTarget?: string
}
