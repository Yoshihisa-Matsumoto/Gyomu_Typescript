import { Effect } from 'effect'
import { logger } from '@gyomu/schema'
import { flattenIssues } from '@gyomu/schema/entity'
import { loadFileAnalysis } from './loadFileAnalysis.js'
import { analyzeFile } from './analyzeFile.js'
import { buildIndex } from './buildIndex.js'

import type { AnalysisOptions } from '@gyomu/schema'
import type { ProjectContext } from './project/ProjectContext.js'
import type { FileAnalysisTransient, ProjectRelativePath, SymbolId } from '@gyomu/schema/typescript'
import type { DependencyCandidate } from '@gyomu/schema/schemas/typescript'

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
      return { result: yield* analyzeFile(context, sourceFilePath, option), created: true }
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
