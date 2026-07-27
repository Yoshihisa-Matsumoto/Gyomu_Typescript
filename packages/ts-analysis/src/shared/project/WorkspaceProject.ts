import type { PackageJsonAnalysis, WorkspaceRelativePath } from '@gyomu/schema/typescript'

/**
 * Represents a project identified within the workspace, containing its path, name, TypeScript configuration status, and package metadata.
 */
export interface WorkspaceProject {
  /**
   * The path to the project root relative to the workspace.
   */
  rootPath: WorkspaceRelativePath

  /**
   * The name of the project.
   */
  name: string

  /**
   * Indicates whether the project is configured for TypeScript.
   */
  hasTypescript: boolean

  /**
   * Analysis results of the project's package.json file.
   */
  packageJson: PackageJsonAnalysis
}
