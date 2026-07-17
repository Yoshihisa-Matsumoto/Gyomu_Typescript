import type { DependencyAnalysis } from './DependencyAnalysis.js'
import type { DirectoryConcept } from '../../schemas/concept/DirectoryConcept.js'
import type { FileSummary } from '../FileSummary.js'
import type { PackageExportAnalysis } from './PackageExportAnalysis.js'

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
  directories: ReadonlyArray<DirectoryConcept>

  /**
   * Summaries of files that are relevant to this package.
   */
  exportedFiles: ReadonlyArray<FileSummary>
}

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
}
