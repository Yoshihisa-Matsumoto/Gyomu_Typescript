import { join } from 'node:path'
import { Project } from 'ts-morph'
import { fromSync } from '@gyomu/schema/effect'
import { AnalysisError } from '../error/AnalysisError.js'
import type { Effect } from 'effect'

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
