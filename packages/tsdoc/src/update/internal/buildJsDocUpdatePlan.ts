import { executeJsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'
import { Effect } from 'effect'
import type { JsDocUpdateContext } from '@gyomu/ai-compiler/jsdoc-update'
import type { UpdateOptions } from '../UpdateOptions.js'

export const buildJsDocUpdatePlan = (context: JsDocUpdateContext, option?: UpdateOptions) =>
  Effect.gen(function* () {
    const result = yield* executeJsDocUpdatePlan(context)
    if (option?.debugInfo?.JsDocUpdatePlan) console.dir(result, { depth: null })
    return result
  })
