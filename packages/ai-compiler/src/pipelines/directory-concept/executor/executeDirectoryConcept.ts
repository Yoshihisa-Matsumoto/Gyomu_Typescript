import { Effect } from 'effect'
import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/loadPrompt.js'
import { renderFileSummary } from '../renderer/renderFileSummary.js'
import { renderSubDirectory } from '../renderer/renderSubDirectory.js'
import { DirectoryConceptSchema } from '../schema/DirectoryConcept.js'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept/DirectoryConcept'
import type { DirectoryConceptInput } from '@gyomu/schema/concept'
import type { AiError, IOError } from '@gyomu/schema'
import type { ModelRoutes, RetryOption, RouteNotFoundError } from '@gyomu/ai'
import type { FileSystem } from 'effect'

export const DirectoryConceptRouteId = ModelRouteId('directory-concept')
export const executeDirectoryConcepts = (
  context: DirectoryConceptInput,
  retryOption?: RetryOption,
): Effect.Effect<
  DirectoryConcept,
  IOError | AiError | RouteNotFoundError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> => {
  const promptFilename = `directory-concept.md`
  // const deepPromptFilename = `tsdoc-update-deep.md`

  return Effect.gen(function* () {
    const service = yield* AiModelRoute
    const basePrompt = yield* loadPrompt(promptFilename)
    // const deepPrompt = yield* loadPrompt(deepPromptFilename)
    const userPrompt = basePrompt
      .replace('<##FILES##>', context.files.map((file) => renderFileSummary(file)).join('\n\n'))
      .replace(
        '<##DIRECTORIES##>',
        context.subDirectories.map((directory) => renderSubDirectory(directory)).join('\n\n'),
      )
    const result = yield* service.generateObject({
      routeId: DirectoryConceptRouteId,
      key: 'fast',
      messages: [{ id: '1', role: MessageRole.user, content: userPrompt }],
      schema: DirectoryConceptSchema,
      retryOption,
    })
    return result.object
  })
}
