import type {
  DependencyKind,
  DependencySource,
} from '../../typescript/packagejson/PackageDependency.js'

export interface DependencyAnalysis {
  packageName: string

  kind: DependencyKind

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
