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

export const translateDocumentContent = <
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
>(args: {
  language: LanguageCodes
  context: Schema.Schema.Type<TSchema>
  sectionDefinition: SectionTranslationDefinition
  contentStrategy: DocumentContentTranslationStrategy<TSchema>
  validationResult: ValidationResult | undefined
  retryOption?: RetryOption
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
        sectionId: args.sectionDefinition.id,
      })),
    ),
  )
