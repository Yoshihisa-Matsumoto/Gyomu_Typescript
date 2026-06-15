import { join } from 'node:path'
import { Effect } from 'effect'
import { readStringFromFile } from '@gyomu/infra/fs'
import { fromSync } from '@gyomu/schema/effect'
import { wrapInfraError } from '@gyomu/schema'
import { Project } from 'ts-morph'
import { AnalysisError } from './error/AnalysisError.js'
import type { FileSystem } from 'effect'
import type { ProjectContext } from './project/ProjectContext.js'

export const initializeProjectContext = (
  projectRoot: string,
): Effect.Effect<ProjectContext, AnalysisError, FileSystem.FileSystem> => {
  const tsConfig = join(projectRoot, 'tsconfig.json')
  const packageJson = join(projectRoot, 'package.json')

  return Effect.gen(function* () {
    const projectContent = yield* readStringFromFile(packageJson).pipe(
      Effect.mapError((e) =>
        wrapInfraError(AnalysisError, e, () => ({
          filePath: packageJson,
          message: 'fail to read package.json',
          phase: 'analysis' as const,
        })),
      ),
    )

    const projectName = yield* fromSync(AnalysisError, () => ({
      filePath: packageJson,
      message: 'fail to analyze package.json',
      phase: 'analysis' as const,
    }))(() => {
      const parsedProject = JSON.parse(projectContent)
      const projectNameInternal = parsedProject.name
      if (!projectNameInternal || typeof projectNameInternal != 'string')
        throw new AnalysisError({
          filePath: packageJson,
          message: 'fail to retrieve package name',
          phase: 'analysis' as const,
          cause: undefined,
        })
      return projectNameInternal
    })

    return {
      project: new Project({
        tsConfigFilePath: tsConfig,
      }),
      projectName,
      projectRoot,
    }
  })
}
