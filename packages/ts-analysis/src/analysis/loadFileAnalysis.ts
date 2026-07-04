import { join } from 'node:path'
import { Effect } from 'effect'
import { pathExists, readJsonFromFile } from '@gyomu/infra/fs'
import { wrapInfraError } from '@gyomu/schema'
import { AnalysisError } from './error/AnalysisError.js'
import type { FileSystem } from 'effect'

import type { FileAnalysis } from './file/FileAnalysis.js'
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
    const analysis = yield* readJsonFromFile<FileAnalysis>(fileAnalysisPath)

    return analysis
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
