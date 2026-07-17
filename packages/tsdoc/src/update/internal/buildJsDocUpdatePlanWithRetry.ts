import { executeJsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'
import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { equalSymbolIdentity, toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { UpdateError } from '../error/UpdateError.js'
import { getTsDocSignatureFromContext, validateJsDocUpdatePlan } from './validateJsDocUpdatePlan.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { JsDocUpdatePlan, TsDocFileContext } from '@gyomu/ai-compiler/jsdoc-update'
import type { UpdateOptions } from '../UpdateOptions.js'

export const buildJsDocUpdatePlanWithRetry = (
  context: TsDocFileContext,
  fileResult: FileAnalysisContext,
  option?: UpdateOptions,
) =>
  Effect.gen(function* () {
    let currentContext = context
    let originalPlan: JsDocUpdatePlan | undefined

    for (let attempt = 0; attempt < 5; attempt++) {
      const plan = yield* executeJsDocUpdatePlan(currentContext, option?.retryOption)
      if (option?.debugInfo?.JsDocUpdatePlan) {
        if (option.debugInfo.DumpToFile)
          yield* writeStringToFile('./log/JsDocUpdatePlan.txt', JSON.stringify(plan, null, 2), {
            flag: 'a',
          })
        else console.dir(plan, { depth: null })
      }

      const overridePlan: JsDocUpdatePlan = overrideJsDocUpdatePlan(
        currentContext,
        plan,
        originalPlan,
      )

      const validation = validateJsDocUpdatePlan(currentContext, overridePlan)
      if (validation.isValid) return overridePlan

      // console.log(`Current attempt : ${attempt + 1}`)
      originalPlan = overridePlan

      currentContext = {
        ...currentContext,
        retry: {
          attempt: attempt + 1,
          missingSymboldentity: validation.diff,
        },
      }
    }

    return yield* Effect.fail(
      new UpdateError({
        cause: currentContext,
        filePath: fileResult.analysis.path,
        message: 'fail to retrieve correct TsDoc with maximum retry',
        phase: 'merge-plan',
      }),
    )
  })

const overrideJsDocUpdatePlan = (
  context: TsDocFileContext,
  plan: JsDocUpdatePlan,
  originalPlan: JsDocUpdatePlan | undefined,
): JsDocUpdatePlan => {
  if (!originalPlan || !context.retry) {
    const contextKeys = getTsDocSignatureFromContext(context)
    const filteredPlan = plan.filter((p) => contextKeys.has(toIdentityKey(p.identity)))
    return [...filteredPlan]
  }

  const overridePlan = [...originalPlan]
  for (const identity of context.retry.missingSymboldentity) {
    const targetPlan = plan.find((p) => equalSymbolIdentity(p.identity, identity))
    if (targetPlan) overridePlan.push(targetPlan)
  }

  return overridePlan
}
