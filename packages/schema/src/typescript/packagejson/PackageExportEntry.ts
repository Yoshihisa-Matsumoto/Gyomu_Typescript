export interface PackageExportEntry {
  /**
   * "." や "./schema/*"
   */
  readonly exportPath: string

  readonly targets: ReadonlyArray<PackageExportTarget>

  /**
   * whether wildcard is contained
   */
  readonly wildcard?: boolean
}

export interface PackageExportTarget {
  readonly condition?: string | undefined

  readonly target: string
}
