/**
 * Defines a dependency specification, including the package name, the version specifier, and the dependency kind.
 */
export interface PackageDependency {
  /**
   * The name of the package.
   */
  readonly packageName: string

  /**
   * The version specifier or source locator for the dependency.
   */
  readonly specifier: string

  /**
   * The category or type of the specifier.
   */
  readonly kind: DependencyKind
}

/**
 * An array of all supported dependency kinds.
 */
export const SupportedDependencyKind = [
  'version',
  'workspace',
  'catalog',
  'file',
  'link',
  'git',
  'url',
  'unknown',
] as const

/**
 * Defines the supported types for a package dependency.
 */
export type DependencyKind = (typeof SupportedDependencyKind)[number]

/**
 * Identifies the dependency kind based on the provided string value.
 *
 * @param value The raw specifier value to categorize.
 *
 * @returns The identified DependencyKind, or 'unknown' if no match is found.
 */
export const getSupportedDependencyKind = (value: string): DependencyKind => {
  for (const kind of SupportedDependencyKind) {
    if (value == kind) return kind
    if (value.startsWith(kind)) return kind
  }
  return 'unknown'
}

/**
 * Defines the specific location or usage context of a dependency within package.json.
 */
export type DependencySource =
  'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency'
