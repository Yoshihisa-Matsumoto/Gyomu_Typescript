import type {
  DependencyKind,
  DependencySource,
} from '../../typescript/packagejson/PackageDependency.js'

/**
 * Represents the analysis results for a package dependency, including identification, source, and version details.
 */
export interface DependencyAnalysis {
  /**
   * The name of the dependency package.
   */
  packageName: string

  /**
   * The categorization or type of the dependency.
   */
  kind: DependencyKind

  /**
   * The source of the dependency definition.
   */
  source: DependencySource

  /**
   * Version specification written in package.json.
   */
  requestedVersion: string

  /**
   * Resolved version.
   */
  resolvedVersion?: string
}
