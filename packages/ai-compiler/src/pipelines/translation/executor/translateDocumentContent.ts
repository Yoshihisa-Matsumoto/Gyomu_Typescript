import { AiModelRoute } from '@gyomu/ai'
import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { TranslationError, wrapInfraError } from '@gyomu/schema'
import { DocumentSectionRouteId } from '../../document/SectionPromptProvider.js'

import { buildTranslationPrompt } from './buildTranslationPrompt.js'
import type { RetryOption } from '@gyomu/schema'
import type { DocumentContent, LanguageCodes } from '@gyomu/schema/schemas/document'
import type {
  DocumentContentTranslationStrategy,
  SectionTranslationDefinition,
  ValidationResult,
} from '@gyomu/schema/document'
import type { Schema } from 'effect'

/**
 * Translates document content for a specific section using an AI model route and content strategy.
 *
 * @param args The translation arguments including language, section ID, context, section definition, content strategy, validation result, and retry options.
 *
 * @returns An Effect containing the translated document content object, or failing with a TranslationError.
 */
export const translateDocumentContent = <
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
>(args: {
  language: LanguageCodes
  sectionId: string
  context: Schema.Schema.Type<TSchema>
  sectionDefinition: SectionTranslationDefinition
  contentStrategy: DocumentContentTranslationStrategy<TSchema>
  validationResult: ValidationResult | undefined
  retryOption?: RetryOption | undefined
}) =>
  Effect.gen(function* () {
    const service = yield* AiModelRoute
    // const deepPrompt = yield* loadPrompt(deepPromptFilename)

    const userPrompt = yield* buildTranslationPrompt(args)
    // console.log(userPrompt)
    const result = yield* service.generateObject({
      routeId: DocumentSectionRouteId,
      key: 'fast',
      messages: [{ id: '1', role: MessageRole.user, content: userPrompt }],
      schema: args.contentStrategy.definition.schema,
      retryOption: args.retryOption,
    })

    return result.object
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(TranslationError, e, () => ({
        contentType: args.context.type,
        phase: 'translate' as const,
        message: 'fail to translate',
        sectionId: args.sectionId,
      })),
    ),
  )
