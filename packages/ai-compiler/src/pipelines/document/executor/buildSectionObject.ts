import { AiModelRoute } from '@gyomu/ai'
import { Effect } from 'effect'
import { DocumentSectionRouteId } from '../SectionPromptProvider.js'
import type { EffectArrayableSchema } from '@gyomu/schema/entity'
import type { Schema } from 'effect'
import type { SectionPromptProvider } from '../SectionPromptProvider.js'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'

export const buildSectionObject = <
  TSectionId extends string,
  TContext,
  TSchema extends EffectArrayableSchema,
  R = never,
>(
  sectionId: TSectionId,
  context: TContext,
  provider: SectionPromptProvider<TSectionId, TContext, R>,
  schema: TSchema,
  retryOption?: RetryOption,
): Effect.Effect<
  Schema.Schema.Type<TSchema>,
  IOError | AiError | RouteNotFoundError,
  R | AiModelRoute | ModelRoutes
> =>
  Effect.gen(function* () {
    const service = yield* AiModelRoute

    const routeId = DocumentSectionRouteId
    const messages = yield* provider.render(sectionId, context)

    const result = yield* service.generateObject({
      routeId,
      key: 'fast',
      messages,
      schema,
      retryOption,
    })

    return result.object
  })
