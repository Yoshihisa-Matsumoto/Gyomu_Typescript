import { Effect } from 'effect'
import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
import { SectionPromptMap } from '../renderer/renderSectionInput.js'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'
import type { FileSystem } from 'effect'
import type { SupportedSectionId } from '../renderer/renderSectionInput.js'

export const ReadmeSectionRouteId = ModelRouteId('readme-section')
export const buildSectionItem = (
  sectionId: SupportedSectionId,
  context: ReadmeBuildContext,
  retryOption?: RetryOption,
): Effect.Effect<
  string,
  IOError | AiError | RouteNotFoundError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> => {
  return Effect.gen(function* () {
    const service = yield* AiModelRoute
    const renderer = SectionPromptMap[sectionId]
    const messages = yield* renderer(context)

    const result = yield* service.generateText({
      routeId: ReadmeSectionRouteId,
      key: 'fast',
      messages,
      retryOption,
    })
    return result.message.text
  })
}
