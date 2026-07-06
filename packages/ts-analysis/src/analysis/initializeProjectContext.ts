import { join, normalize, relative } from 'node:path'
import { Effect } from 'effect'
import { readStringFromFile } from '@gyomu/infra/fs'
import { fromSync } from '@gyomu/schema/effect'
import { wrapInfraError } from '@gyomu/schema'
import { Project } from 'ts-morph'
import { FullPath } from '@gyomu/schema/typescript'
import { normalizePath } from '../shared/index.js'
import { AnalysisError } from './error/AnalysisError.js'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import type { FileSystem } from 'effect'
import type { ProjectContext } from './project/ProjectContext.js'

export const initializeProjectContext = (args: {
  repoRoot: FullPath
  projectRelativePath: WorkspaceRelativePath
}): Effect.Effect<ProjectContext, AnalysisError, FileSystem.FileSystem> => {
  const projectRootAbsolutePath = join(args.repoRoot, args.projectRelativePath)
  const tsConfig = join(projectRootAbsolutePath, 'tsconfig.json')
  const packageJson = join(projectRootAbsolutePath, 'package.json')

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
    const project = new Project({
      tsConfigFilePath: tsConfig,
    })
    return {
      project,
      projectName,
      projectRoot: FullPath(projectRootAbsolutePath),
      includedFiles: new Set(
        project
          .getSourceFiles()
          .map((file) => normalize(file.getFilePath()))
          .filter((filePath) => filePath.startsWith(projectRootAbsolutePath))
          .map((fileAbsolutePath) =>
            normalizePath(relative(projectRootAbsolutePath, fileAbsolutePath)),
          ),
      ),
    }
  })
}
