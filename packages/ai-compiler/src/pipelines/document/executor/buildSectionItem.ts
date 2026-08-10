import { AiModelRoute } from '@gyomu/ai'
import { Effect } from 'effect'
import { DocumentSectionRouteId } from '../SectionPromptProvider.js'
import type { SectionPromptProvider } from '../SectionPromptProvider.js'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'

/**
 * Builds a section item by rendering prompts using the provided section prompt provider and generating text via the AI model route.
 *
 * @param sectionId The identifier of the section to build.
 *
 * @param context The context object used for rendering prompts.
 *
 * @param provider The provider used to render prompts for the section.
 *
 * @param retryOption Optional retry configuration for text generation.
 *
 * @returns An effect yielding the generated text string, requiring services R, AiModelRoute, and ModelRoutes, and potentially failing with IOError, AiError, or RouteNotFoundError.
 */
export const buildSectionItem = <TSectionId extends string, TContext, R = never>(
  sectionId: TSectionId,
  context: TContext,
  provider: SectionPromptProvider<TSectionId, TContext, R>,

  retryOption?: RetryOption,
): Effect.Effect<string, IOError | AiError | RouteNotFoundError, R | AiModelRoute | ModelRoutes> =>
  Effect.gen(function* () {
    const service = yield* AiModelRoute

    const routeId = DocumentSectionRouteId
    const messages = yield* provider.render(sectionId, context)

    const result = yield* service.generateText({
      routeId,
      key: 'fast',
      messages,
      retryOption,
    })

    return result.message.text
  })
