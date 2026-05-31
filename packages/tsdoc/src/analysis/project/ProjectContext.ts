import type { Project } from 'ts-morph'

export interface ProjectContext {
  /**
   * ts-morph project.
   */
  project: Project

  /**
   * Project root directory.
   */
  projectRoot: string
}
