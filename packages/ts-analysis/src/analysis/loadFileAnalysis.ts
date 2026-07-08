import { join } from 'node:path'
import { Effect, Result } from 'effect'
import { pathExists, readJsonFromFileAndValidate } from '@gyomu/infra/fs'
import { wrapInfraError } from '@gyomu/schema'
import { AnalysisError } from './error/AnalysisError.js'
import { FileAnalysis } from './file/FileAnalysis.js'
import type { FileSystem } from 'effect'

import type { ProjectContext } from './project/ProjectContext.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export const loadFileAnalysis = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
): Effect.Effect<FileAnalysis | undefined, AnalysisError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fileAnalysisPath = join(context.projectRoot, '.gyomu', sourceFilePath + '.json')

    const fileExists = yield* pathExists(fileAnalysisPath)
    if (!fileExists) return undefined
    const analysisResult = yield* readJsonFromFileAndValidate(FileAnalysis, fileAnalysisPath)
    if (Result.isSuccess(analysisResult)) return analysisResult.success
    return yield* Effect.fail(
      new AnalysisError({
        cause: analysisResult.failure,
        phase: 'analysis' as const,
        filePath: sourceFilePath,
        message: 'fail to validate FileAnalysis',
      }),
    )
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(AnalysisError, e, () => ({
        cause: e,
        phase: 'analysis' as const,
        filePath: sourceFilePath,
        message: 'fail to load FileAnalysis',
      })),
    ),
  )
