import { executeJsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'
import type { JsDocUpdateContext } from '@gyomu/ai-compiler/jsdoc-update'

export const buildJsDocUpdateContextPlan = (context: JsDocUpdateContext) => {
  return executeJsDocUpdatePlan(context)
}
