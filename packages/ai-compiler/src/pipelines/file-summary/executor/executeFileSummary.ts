import { Effect } from 'effect'
import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/loadPrompt.js'
import { renderFileConceptInput } from '../renderer/renderFileConceptInput.js'
import type { FileConceptInput } from '../context/FileConceptInput.js'
import type { AiError, IOError } from '@gyomu/schema'
import type { ModelRoutes, RetryOption, RouteNotFoundError } from '@gyomu/ai'
import type { FileSystem } from 'effect'

export const FileSummaryRouteId = ModelRouteId('file-summary')
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
