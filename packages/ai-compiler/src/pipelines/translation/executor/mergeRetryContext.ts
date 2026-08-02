import { Effect } from 'effect'
import { TranslationError } from '@gyomu/schema'
import type { DocumentContent } from '@gyomu/schema/schemas/document'
import type {
  DocumentContentTranslationStrategy,
  SectionTranslationDefinition,
  TranslationState,
  ValidationResult,
} from '@gyomu/schema/document'
import type { Schema } from 'effect'

export const mergeRetryContext = <
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
>(args: {
  sectionId: string
  sectionDefinition: SectionTranslationDefinition
  contentStrategy: DocumentContentTranslationStrategy<TSchema>
  currentValidation: ValidationResult
  previousValidation: ValidationResult | undefined
  originalContext: Schema.Schema.Type<TSchema>
  translatedContext: Schema.Schema.Type<TSchema>
}): Effect.Effect<TranslationState<TSchema>, TranslationError> => {
  const {
    originalContext,
    sectionDefinition,
    translatedContext,
    currentValidation,
    previousValidation,
  } = args

  if (currentValidation.isValid || previousValidation?.isValid) {
    return Effect.fail(
      new TranslationError({
        contentType: originalContext.type,
        cause: undefined,
        message: 'Invalid call. Should be called only when validation result fails',
        phase: 'retry-context',
        sectionId: args.sectionId,
      }),
    )
  }
  return args.contentStrategy.retryContextUpdater({
    sectionId: args.sectionId,
    sectionDefinition,
    currentValidation,
    previousValidation,
    originalContext,
    translatedContext,
  })
}
