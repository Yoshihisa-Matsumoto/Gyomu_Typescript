import type { PackageJsonAnalysis, ProjectRelativePath } from '@gyomu/schema/typescript'
import type { FullPath } from '@gyomu/schema'
import type { Project } from 'ts-morph'

/**
 * Represents the context of a project analysis, including its root directory, project configuration, and associated package information.
 */
export interface ProjectContext {
  /**
   * ts-morph project.
   */
  project: Project

  /**
   * Project root directory.
   */
  projectRoot: FullPath

  /**
   * The root directory of the source code, relative to the project root.
   */
  sourceRoot: ProjectRelativePath

  /**
   * The analysis results of the project's package.json file.
   */
  packageJson: PackageJsonAnalysis

  /**
   * Project name
   */
  projectName: string

  /**
   * A set of file paths included in the analysis.
   */
  includedFiles: Set<string>
}
