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
  context: Schema.Schema.Type<TSchema>
  sectionDefinition: SectionTranslationDefinition
  contentStrategy: DocumentContentTranslationStrategy<TSchema>
  validationResult: ValidationResult | undefined
  retryOption?: RetryOption
}) => retryDocumentContentTranslation(args, MAX_TRANSLATION_ATTEMPTS)

export const retryDocumentContentTranslation = <
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
>(
  args: {
    language: LanguageCodes
    context: Schema.Schema.Type<TSchema>
    sectionDefinition: SectionTranslationDefinition
    contentStrategy: DocumentContentTranslationStrategy<TSchema>
    validationResult: ValidationResult | undefined
    retryOption?: RetryOption
  },
  maxAttempt: number,
) =>
  Effect.gen(function* () {
    let attempt = 0
    let currentValidation: ValidationResult | undefined = undefined
    let updateContext = args.context
    let previousValidation: ValidationResult | undefined

    while (attempt < maxAttempt) {
      const result = yield* translateDocumentContent({ ...args, context: updateContext })

      previousValidation = currentValidation

      currentValidation = args.contentStrategy.definition.reconciliation.validate(
        updateContext,
        result,
      )

      if (currentValidation.isValid) {
        return result
      }

      updateContext = yield* mergeRetryContext({
        sectionDefinition: args.sectionDefinition,
        contentStrategy: args.contentStrategy,
        currentValidation,
        previousValidation,
        originalContext: updateContext,
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
        sectionId: args.sectionDefinition.id,
      }),
    )
  })
