import { join } from 'node:path'
import { Effect } from 'effect'
import { pathExists, readJsonFromFileAndValidate } from '@gyomu/infra/fs'
import { FullPath, SchemaValidationError, wrapInfraError } from '@gyomu/schema'
import { FileAnalysisSchema } from '@gyomu/schema/schemas/typescript'
import { flattenIssues } from '@gyomu/schema/entity'
import { AnalysisError } from './error/AnalysisError.js'
import type { FileAnalysis } from '@gyomu/schema/schemas/typescript'
import type { IOError } from '@gyomu/schema'
import type { FileSystem } from 'effect'

import type { ProjectContext } from './project/ProjectContext.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export const loadFileAnalysis = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
): Effect.Effect<FileAnalysis | undefined, IOError | AnalysisError, FileSystem.FileSystem> =>
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
        details:
          e instanceof SchemaValidationError
            ? e.issues
              ? flattenIssues(e.issues as any)
              : undefined
            : undefined,
      })),
    ),
  )
