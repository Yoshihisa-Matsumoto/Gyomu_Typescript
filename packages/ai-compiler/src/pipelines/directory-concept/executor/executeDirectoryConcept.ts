import { Effect } from 'effect'
import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { DirectoryConcept } from '@gyomu/schema/schemas/concept'
import { loadPrompt } from '../prompt/loadPrompt.js'
import { renderFileSummary } from '../renderer/renderFileSummary.js'
import { renderSubDirectory } from '../renderer/renderSubDirectory.js'
import type { DirectoryConceptInput } from '@gyomu/schema/concept'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'
import type { FileSystem } from 'effect'

/**
 * The unique identifier for the directory concept model route.
 */
export const DirectoryConceptRouteId = ModelRouteId('directory-concept')

/**
 * Executes the directory concept extraction pipeline using the provided input context and optional retry configuration.
 *
 * @param context The input data containing file lists and subdirectories to process.
 *
 * @param retryOption Optional configuration for retry attempts.
 *
 * @returns An Effect that yields a DirectoryConcept upon success, or fails with IOError, AiError, or RouteNotFoundError.
 *
 * @requires AiModelRoute, FileSystem, and ModelRoutes services.
 */
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
      schema: DirectoryConcept,
      retryOption,
    })
    return result.object
  })
}
