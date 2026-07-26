import { Effect } from 'effect'
import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/loadPrompt.js'
import { renderFileConceptInput } from '../renderer/renderFileConceptInput.js'
import type { FileConceptInput } from '../context/FileConceptInput.js'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'
import type { FileSystem } from 'effect'

/**
 * Represents the unique route identifier for the file summary generation model.
 */
export const FileSummaryRouteId = ModelRouteId('file-summary')

/**
 * Executes the file summary generation pipeline by processing the provided file concept input through the configured AI model.
 *
 * @param context The input data representing the file concept to be summarized.
 *
 * @param retryOption Optional retry configuration for the AI service generation request.
 *
 * @returns An Effect that yields the generated summary string upon success, or fails with an IOError, AiError, or RouteNotFoundError.
 *
 * @requirements AiModelRoute, FileSystem, and ModelRoutes services.
 */
export const executeFileSummary = (
  context: FileConceptInput,
  retryOption?: RetryOption,
): Effect.Effect<
  string,
  IOError | AiError | RouteNotFoundError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> => {
  const sysmtemPromptFilename = `system.md`
  const userPromptFilename = `user.md`

  return Effect.gen(function* () {
    const service = yield* AiModelRoute
    const systemPrompt = yield* loadPrompt(sysmtemPromptFilename)
    const userPromptBase = yield* loadPrompt(userPromptFilename)
    const userPrompt = userPromptBase.replace('<##INPUT##>', renderFileConceptInput(context))

    const result = yield* service.generateText({
      routeId: FileSummaryRouteId,
      key: 'fast',
      messages: [
        { id: '1', role: MessageRole.system, content: systemPrompt },
        { id: '2', role: MessageRole.user, content: userPrompt },
      ],
      retryOption,
    })
    return result.message.text
  })
}
