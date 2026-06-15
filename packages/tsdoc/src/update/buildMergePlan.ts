import { fromSync } from '@gyomu/schema/effect'
import { Effect } from 'effect'

import { calculateComplexityMetrics } from '../evaluation/complexity/calculateComplexityMetrics.js'
import { buildJsDocUpdateContext } from './internal/buildJsDocUpdateContext.js'
import { UpdateError } from './error/UpdateError.js'
import { buildJsDocUpdatePlan } from './internal/buildJsDocUpdatePlan.js'
import { createMergePlan } from './internal/createMargePlan.js'
import type { FileSystem } from 'effect'
import type { FileAnalysisResult } from '../analysis/file/FileAnalysisResult.js'
import type { MergePlan } from './jsdoc/MergePlan.js'
import type { AiModelService } from '@gyomu/ai'
import type { UpdateOptions } from './UpdateOptions.js'

export const buildMergePlan = (
  projectName: string,
  fileResult: FileAnalysisResult,
  option?: UpdateOptions,
): Effect.Effect<Array<MergePlan>, UpdateError, FileSystem.FileSystem | AiModelService> => {
  const mapComplexity = calculateComplexityMetrics(fileResult)

  return Effect.gen(function* () {
    const contexts = yield* fromSync(UpdateError, () => ({
      filePath: fileResult.analysis.path,
      message: 'Failed to build merge plan',
      phase: 'context-build' as const,
    }))(() => {
      return buildJsDocUpdateContext(projectName, fileResult, mapComplexity)
    })
    if (option?.debugInfo?.JsDocUpdateContext) console.dir(contexts, { depth: null })
    const mergePlans = yield* Effect.forEach(contexts, (context) =>
      buildJsDocUpdatePlan(context, option).pipe(
        Effect.flatMap((plan) => createMergePlan(fileResult.analysis.path, context, plan)),
        Effect.mapError(
          (error) =>
            new UpdateError({
              cause: error,
              filePath: fileResult.analysis.path,
              symbolId: context.target.symbolId,
              message: `Failed to build merge plan for symbol ${context.target.symbolId}: ${error.message}`,
              phase: 'merge-plan' as const,
            }),
        ),
      ),
    ).pipe(Effect.map((plans) => plans.flat()))
    if (option?.debugInfo?.MergePlan) console.dir(mergePlans, { depth: null })
    return mergePlans
  })
}
