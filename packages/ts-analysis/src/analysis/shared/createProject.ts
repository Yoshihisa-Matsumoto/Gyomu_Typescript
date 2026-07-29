import { join } from 'node:path'
import { Project } from 'ts-morph'
import { fromSync } from '@gyomu/schema/effect'
import { AnalysisError } from '../error/AnalysisError.js'
import type { Effect } from 'effect'

/**
 * Initializes a new project by loading the tsconfig.json file from the specified path.
 *
 * @param projectPath The directory path where the project's tsconfig.json is located.
 *
 * @returns An Effect representing the successfully loaded Project, or an AnalysisError if the loading fails.
 */
export const createProject = (projectPath: string): Effect.Effect<Project, AnalysisError> => {
  return fromSync(AnalysisError, () => ({
    filePath: projectPath,
    phase: 'project-load' as const,
    message: 'fail to load project',
  }))(
    () =>
      new Project({
        tsConfigFilePath: join(projectPath, 'tsconfig.json'),
      }),
  )
}
