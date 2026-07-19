/**
 * Represents an entry within the package exports configuration, defining the mapping from an export path to one or more targets.
 */
export interface PackageExportEntry {
  /**
   * The export path pattern, such as "." or "./schema/*".
   */
  readonly exportPath: string

  /**
   * A collection of targets corresponding to the export path.
   */
  readonly targets: ReadonlyArray<PackageExportTarget>

  /**
   * Indicates whether the export path contains a wildcard.
   */
  readonly wildcard?: boolean
}

/**
 * Represents a specific export target associated with an export condition.
 */
export interface PackageExportTarget {
  /**
   * The optional condition (e.g., 'import', 'require', 'types') for this export target.
   */
  readonly condition?: string | undefined

  /**
   * The file path target for the export.
   */
  readonly target: string
}
