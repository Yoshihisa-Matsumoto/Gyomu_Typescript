import type { FullPath } from '@gyomu/schema/typescript'
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

  /**
   * Project name
   */
  projectName: string

  includedFiles: Set<string>
}
