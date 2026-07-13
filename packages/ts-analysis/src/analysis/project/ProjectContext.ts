import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { FullPath } from '@gyomu/schema'
import type { Project } from 'ts-morph'

export interface ProjectContext {
  /**
   * ts-morph project.
   */
  project: Project

  /**
   * Project root directory.
   */
  projectRoot: FullPath

  sourceRoot: ProjectRelativePath

  /**
   * Project name
   */
  projectName: string

  includedFiles: Set<string>
}
