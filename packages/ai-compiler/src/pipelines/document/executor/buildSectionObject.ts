import { AiModelRoute } from '@gyomu/ai'
import { Effect } from 'effect'
import { DocumentSectionRouteId } from '../SectionPromptProvider.js'
import type { EffectArrayableSchema } from '@gyomu/schema/entity'
import type { Schema } from 'effect'
import type { SectionPromptProvider } from '../SectionPromptProvider.js'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'

/**
 * Builds a section object using an AI prompt provider and validates it against the given schema, requiring AI model route services.
 *
 * @param sectionId The unique identifier of the section.
 *
 * @param context The context object used to render the prompt.
 *
 * @param provider The prompt provider for rendering messages.
 *
 * @param schema The schema to validate and parse the generated object.
 *
 * @param retryOption Optional retry configuration for generation.
 *
 * @returns An Effect returning the parsed object type of the schema, which may fail with IOError, AiError, or RouteNotFoundError, requiring R, AiModelRoute, and ModelRoutes.
 */
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
