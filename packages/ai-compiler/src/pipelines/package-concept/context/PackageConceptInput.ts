import type { PackageInfoAnalysis } from '@gyomu/schema/concept'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Represents the input structure for a package concept analysis, including package metadata, directory structure, public API definitions, and package dependencies.
 */
export interface PackageConceptInput {
  /**
   * The analysis data for the package.
   */
  package: PackageInfoAnalysis

  /**
   * A collection of significant directories in the package, including their path, importance, summary, and responsibilities.
   */
  topDirectories: Array<{
    path: ProjectRelativePath
    importance: string
    summary: string
    responsibilities: ReadonlyArray<string>
  }>

  /**
   * The public API definitions for the package, grouped by export path.
   */
  publicApi: Array<{
    exportPath: string
    symbols: Array<{
      name: string
      summary: string
    }>
  }>

  /**
   * A list of package dependencies, each including its name and version.
   */
  dependencies: Array<{
    /**
     * The name of the dependency package.
     */
    packageName: string

    version: string
  }>
}
