import { executeJsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'
import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import type { TsDocFileContext } from '@gyomu/ai-compiler/jsdoc-update'
import type { UpdateOptions } from '../UpdateOptions.js'

export const buildJsDocUpdatePlan = (context: TsDocFileContext, option?: UpdateOptions) =>
  Effect.gen(function* () {
    const result = yield* executeJsDocUpdatePlan(context)
    if (option?.debugInfo?.JsDocUpdatePlan) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile('./log/JsDocUpdatePlan.txt', JSON.stringify(result, null, 2), {
          flag: 'a',
        })
      else console.dir(result, { depth: null })
    }
    return result
  })
