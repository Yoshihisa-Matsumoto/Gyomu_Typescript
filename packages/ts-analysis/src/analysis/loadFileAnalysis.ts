import { join } from 'node:path'
import { Effect } from 'effect'
import { pathExists, readJsonFromFileAndValidate } from '@gyomu/infra/fs'
import { FullPath, wrapInfraError } from '@gyomu/schema'
import { FileAnalysisSchema } from '@gyomu/schema/schemas/typescript'
import { AnalysisError } from './error/AnalysisError.js'

import type { ProjectContext } from './project/ProjectContext.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export const loadFileAnalysis = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
) =>
  Effect.gen(function* () {
    const fileAnalysisPath = FullPath(join(context.projectRoot, '.gyomu', sourceFilePath + '.json'))

    const fileExists = yield* pathExists(fileAnalysisPath)
    if (!fileExists) return undefined
    return yield* readJsonFromFileAndValidate('FileAnalysis', FileAnalysisSchema, fileAnalysisPath)
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
