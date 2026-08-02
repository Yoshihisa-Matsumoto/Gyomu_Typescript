import { Effect } from 'effect'
import { TranslationError } from '@gyomu/schema'
import { mergeRetryContext } from './mergeRetryContext.js'
import { translateDocumentContent } from './translateDocumentContent.js'
import type { RetryOption } from '@gyomu/schema'
import type { DocumentContent, LanguageCodes } from '@gyomu/schema/schemas/document'
import type {
  DocumentContentTranslationStrategy,
  SectionTranslationDefinition,
  ValidationResult,
} from '@gyomu/schema/document'
import type { Schema } from 'effect'

const MAX_TRANSLATION_ATTEMPTS = 5
export const executeDocumentContentTranslation = <
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
>(args: {
  language: LanguageCodes
  sectionId: string
  context: Schema.Schema.Type<TSchema>
  sectionDefinition: SectionTranslationDefinition
  contentStrategy: DocumentContentTranslationStrategy<TSchema>
  retryOption?: RetryOption | undefined
}) =>
  Effect.gen(function* () {
    return (yield* retryDocumentContentTranslation(
      args,
      MAX_TRANSLATION_ATTEMPTS,
    )) as DocumentContent
  })

interface TemporallyTranslationState<
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
> {
  context: Schema.Schema.Type<TSchema>
  validation: ValidationResult | undefined
}

export const retryDocumentContentTranslation = <
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
>(
  args: {
    language: LanguageCodes
    sectionId: string
    context: Schema.Schema.Type<TSchema>
    sectionDefinition: SectionTranslationDefinition
    contentStrategy: DocumentContentTranslationStrategy<TSchema>
    retryOption?: RetryOption | undefined
  },
  maxAttempt: number,
) =>
  Effect.gen(function* () {
    let attempt = 0
    let currentValidation: ValidationResult | undefined = undefined
    let updateTrasnlationState: TemporallyTranslationState<TSchema> = {
      context: args.context,
      validation: currentValidation,
    }
    let previousValidation: ValidationResult | undefined

    while (attempt < maxAttempt) {
      const result = yield* translateDocumentContent({
        ...args,
        context: updateTrasnlationState.context,
        validationResult: updateTrasnlationState.validation,
      })

      previousValidation = currentValidation

      currentValidation = args.contentStrategy.definition.reconciliation.validate(
        updateTrasnlationState.context,
        result,
      )

      if (currentValidation.isValid) {
        return result
      }

      updateTrasnlationState = yield* mergeRetryContext({
        sectionId: args.sectionId,
        sectionDefinition: args.sectionDefinition,
        contentStrategy: args.contentStrategy,
        currentValidation,
        previousValidation,
        originalContext: updateTrasnlationState.context,
        translatedContext: result,
      })

      attempt++
    }

    return yield* Effect.fail(
      new TranslationError({
        cause: undefined,
        contentType: args.context.type,
        message: 'translation failed with maximum retry',
        phase: 'retry',
        sectionId: args.sectionId,
      }),
    )
  })
