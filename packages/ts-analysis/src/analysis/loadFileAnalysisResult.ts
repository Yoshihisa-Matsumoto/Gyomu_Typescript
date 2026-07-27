import { Effect } from 'effect'
import { logger, wrapInfraError } from '@gyomu/schema'
import { flattenIssues } from '@gyomu/schema/entity'
import { loadFileAnalysis } from './loadFileAnalysis.js'
import { analyzeFile } from './analyzeFile.js'
import { buildIndex } from './buildIndex.js'

import { saveFileAnalysis } from './saveFileAnalysis.js'
import { AnalysisError } from './error/AnalysisError.js'
import type { AnalysisOptions } from '@gyomu/schema'
import type { ProjectContext } from './project/ProjectContext.js'
import type { FileAnalysisTransient, ProjectRelativePath, SymbolId } from '@gyomu/schema/typescript'
import type { DependencyCandidate } from '@gyomu/schema/schemas/typescript'

/**
 * Loads a file analysis result from storage if available, or performs a new analysis and saves it.
 *
 * @param context The project context.
 *
 * @param sourceFilePath Path accepted by {@link Project.getSourceFile}.
 *
 * @param option Optional analysis configuration.
 *
 * @returns An Effect that resolves to the file analysis result, metadata, and creation status.
 */
export const loadFileAnalysisResult = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
  option?: AnalysisOptions,
) =>
  Effect.gen(function* () {
    const transient: FileAnalysisTransient = {
      dependencyCandidates: new Map<SymbolId, ReadonlyArray<DependencyCandidate>>(),
    }
    const analysis = yield* loadFileAnalysis(context, sourceFilePath).pipe(
      Effect.catch((e) => {
        logger.info(e, 'Error on loadFileAnalysis')
        if (e._tag == '@gyomu/agent/tsdoc/AnalysisError') {
          const error = e.cause as object
          if ('issues' in error) {
            if (error.issues) {
              const issue = flattenIssues(error.issues as any)
              logger.info(issue, 'Schema Issue')
            }
          }
        }

        return Effect.succeed(undefined)
      }),
    )
    if (!analysis) {
      const fileAnalysis = yield* analyzeFile(context, sourceFilePath, option)
      yield* saveFileAnalysis(context, fileAnalysis.analysis).pipe(
        Effect.mapError((e) =>
          wrapInfraError(AnalysisError, e, () => ({
            cause: e,
            phase: 'analysis' as const,
            filePath: sourceFilePath,
            message: 'fail to save FileAnalysis',
          })),
        ),
      )
      return { result: fileAnalysis, created: true }
    }

    const metadata = buildIndex(analysis)
    // compute metadata / transient
    if (option?.computeMetadataAndTransient) {
      //
    }

    return {
      result: {
        analysis,
        metadata,
        transient,
      },
      created: false,
    }
  })
