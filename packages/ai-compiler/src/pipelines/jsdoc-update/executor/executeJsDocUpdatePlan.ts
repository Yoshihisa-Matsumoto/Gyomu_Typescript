import { Effect } from 'effect'
import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/loadPrompt.js'
import { JsDocUpdatePlanSchema } from '../schema/JsDocUpdatePlan.js'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'
import type { JsDocUpdatePlan } from '../schema/JsDocUpdatePlan.js'
import type { FileSystem } from 'effect'
import type { TsDocFileContext } from '../context/TsDocFileContext.js'

export const TsDocRouteId = ModelRouteId('tsdoc')
export const executeJsDocUpdatePlan = (
  context: TsDocFileContext,
  retryOption?: RetryOption,
): Effect.Effect<
  JsDocUpdatePlan,
  IOError | AiError | RouteNotFoundError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> => {
  const promptFilename = `tsdoc-update-base.md`
  // const deepPromptFilename = `tsdoc-update-deep.md`

  return Effect.gen(function* () {
    const service = yield* AiModelRoute
    const basePrompt = yield* loadPrompt(promptFilename)
    // const deepPrompt = yield* loadPrompt(deepPromptFilename)
    const prompt = basePrompt
    // if (context.mode === 'deep') {
    //   prompt += '\n\n' + deepPrompt
    // }
    const result = yield* service.generateObject({
      routeId: TsDocRouteId,
      key: 'fast',
      messages: [
        { id: '1', role: MessageRole.system, content: prompt },
        { id: '2', role: MessageRole.user, content: JSON.stringify(context, null, 2) },
      ],
      schema: JsDocUpdatePlanSchema,
      retryOption,
    })
    return result.object
  })
}
