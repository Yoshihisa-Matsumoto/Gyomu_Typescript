import { AiModelRoute } from '@gyomu/ai'
import { Effect } from 'effect'
import { DocumentSectionRouteId } from '../SectionPromptProvider.js'
import type { SectionPromptProvider } from '../SectionPromptProvider.js'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'

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
