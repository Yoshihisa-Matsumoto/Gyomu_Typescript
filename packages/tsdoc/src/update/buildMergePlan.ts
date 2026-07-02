import { fromSync } from '@gyomu/schema/effect'
import { Effect } from 'effect'

import { writeStringToFile } from '@gyomu/infra/fs'
import { calculateComplexityMetrics } from '../evaluation/complexity/calculateComplexityMetrics.js'
import { buildJsDocUpdateContext } from './internal/buildJsDocUpdateContext.js'
import { UpdateError } from './error/UpdateError.js'
import { buildJsDocUpdatePlanWithRetry } from './internal/buildJsDocUpdatePlanWithRetry.js'
import { createMergePlan } from './internal/createMargePlan.js'
import type { FileSystem } from 'effect'
import type { FileAnalysisResult } from '@gyomu/ts-analysis'
import type { MergePlan } from './jsdoc/MergePlan.js'
import type { AiModelService } from '@gyomu/ai'
import type { UpdateOptions } from './UpdateOptions.js'
import type { IOError } from '@gyomu/schema'

export const buildMergePlan = (
  projectName: string,
  fileResult: FileAnalysisResult,
  option?: UpdateOptions,
): Effect.Effect<
  Array<MergePlan>,
  UpdateError | IOError,
  FileSystem.FileSystem | AiModelService
> => {
  const mapComplexity = calculateComplexityMetrics(fileResult)

  return Effect.gen(function* () {
    const contexts = yield* fromSync(UpdateError, () => ({
      filePath: fileResult.analysis.path,
      message: 'Failed to build merge plan',
      phase: 'context-build' as const,
    }))(() => {
      return buildJsDocUpdateContext(projectName, fileResult, mapComplexity)
    })
    if (option?.debugInfo?.JsDocUpdateContext) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile('./log/JsDocUpdateContext.txt', JSON.stringify(contexts, null, 2))
      else console.dir(contexts, { depth: null })
    }
    if (option?.debugInfo?.JsDocUpdatePlan) {
      if (option.debugInfo.DumpToFile) yield* writeStringToFile('./log/JsDocUpdatePlan.txt', '')
    }
    if (option?.action?.NoLLMRequest) {
      return []
    }
    const plans = yield* buildJsDocUpdatePlanWithRetry(contexts, fileResult, option)
    const mergePlans = yield* createMergePlan(fileResult, plans)

    if (option?.debugInfo?.MergePlan) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile('./log/MergePlan.txt', JSON.stringify(mergePlans, null, 2))
      else console.dir(mergePlans, { depth: null })
    }
    return mergePlans
  }).pipe(
    Effect.mapError(
      (error) =>
        new UpdateError({
          cause: error,
          filePath: fileResult.analysis.path,
          message: `Failed to build merge plan : ${error.message}`,
          phase: 'merge-plan' as const,
        }),
    ),
  )
}
