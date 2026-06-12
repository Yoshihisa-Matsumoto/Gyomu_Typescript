import { executeJsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'
import { Console, Effect } from 'effect'
import type { JsDocUpdateContext } from '@gyomu/ai-compiler/jsdoc-update'

export const buildJsDocUpdatePlan = (context: JsDocUpdateContext) => {
  return executeJsDocUpdatePlan(context).pipe(Effect.tap((a) => Console.dir(a, { depth: null })))
}
