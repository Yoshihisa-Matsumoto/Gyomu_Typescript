import type { DirectoryConcept } from '../../schemas/concept/DirectoryConcept.js'
import type { DependencyAnalysis } from './DependencyAnalysis.js'
import type { FileSummary } from '../FileSummary.js'
import type { PackageExportAnalysis } from './PackageExportAnalysis.js'
import type { ProjectRelativePath } from '../../typescript/types.js'

/**
 * Represents the full analysis of a package, including its metadata, exports, dependencies, and file structure.
 */
export interface PackageAnalysis {
  /**
   * Basic package information.
   */
  package: PackageInfoAnalysis

  /**
   * Public API exposed by this package.
   */
  exports: ReadonlyArray<PackageExportAnalysis>

  /**
   * Package dependencies.
   */
  dependencies: ReadonlyArray<DependencyAnalysis>

  /**
   * Directories that participate in the public implementation of this package.
   */
  directories: ReadonlyArray<DirectoryAnalysis>

  /**
   * Summaries of files that are relevant to this package.
   */
  exportedFiles: ReadonlyArray<FileSummary>
}

/**
 * Represents the analysis of a specific directory within a project, including its path and conceptual summary.
 */
export interface DirectoryAnalysis {
  /**
   * The path of the directory relative to the project root.
   */
  path: ProjectRelativePath

  /**
   * Contains statistical information about the directory, including public and root API symbol counts.
   */
  facts: {
    /**
     * The count of symbols that form the public API of this directory.
     */
    publicApiSymbolCount: number

    /**
     * The count of symbols exposed at the root level of the directory's API.
     */
    rootApiSymbolCount: number
  }

  /**
   * The conceptual summary or classification of the directory contents.
   */
  concept: DirectoryConcept
}

/**
 * Encapsulates essential package metadata, such as identity, versioning, environment requirements, and configuration settings.
 */
export interface PackageInfoAnalysis {
  /**
   * Package name.
   */
  name: string

  /**
   * Package description.
   */
  description?: string | undefined

  /**
   * Package version.
   */
  version: string

  /**
   * Whether this package is private.
   */
  private: boolean

  /**
   * Module type (commonjs / module).
   */
  type: 'commonjs' | 'module'

  /**
   * Package manager declaration.
   */
  packageManager?: string

  /**
   * The license under which the package is published.
   */
  license: string
}
