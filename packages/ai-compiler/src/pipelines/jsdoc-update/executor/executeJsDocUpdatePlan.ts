import { Effect } from 'effect'
import { AI_MODELS, AiModelService } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { withOptional } from '@gyomu/schema'
import { loadPrompt } from '../prompt/loadPrompt.js'
import { JsDocUpdatePlanSchema } from '../schema/JsDocUpdatePlan.js'
import type { AiError, IOError } from '@gyomu/schema'
import type { RetryOption } from '@gyomu/ai'
import type { JsDocUpdatePlan } from '../schema/JsDocUpdatePlan.js'
import type { FileSystem } from 'effect'
import type { TsDocFileContext } from '../context/TsDocFileContext.js'

export const executeJsDocUpdatePlan = (
  context: TsDocFileContext,
  retryOption?: RetryOption,
): Effect.Effect<JsDocUpdatePlan, IOError | AiError, AiModelService | FileSystem.FileSystem> => {
  const promptFilename = `tsdoc-update-base.md`
  // const deepPromptFilename = `tsdoc-update-deep.md`

  return Effect.gen(function* () {
    const service = yield* AiModelService
    const basePrompt = yield* loadPrompt(promptFilename)
    // const deepPrompt = yield* loadPrompt(deepPromptFilename)
    const prompt = basePrompt
    // if (context.mode === 'deep') {
    //   prompt += '\n\n' + deepPrompt
    // }
    const result = yield* service.generateObject(
      withOptional({
        model: AI_MODELS.fast,
        messages: [
          { id: '1', role: MessageRole.system, content: prompt },
          { id: '2', role: MessageRole.user, content: JSON.stringify(context, null, 2) },
        ],
        schema: JsDocUpdatePlanSchema,
        retryOption,
      }),
    )
    return result.object
  })
}
