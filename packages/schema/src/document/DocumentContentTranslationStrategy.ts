import type { TranslationError } from '../error/TranslationError.js'
import type {
  DocumentContentDefinitionBase,
  ValidationResult,
} from './DocumentContentDefinitionBase.js'
import type { SectionTranslationDefinition } from './SectionTranslationDefinition.js'
import type { DocumentContent } from '../schemas/document/DocumentContent.js'
import type { Effect, Schema } from 'effect'

export interface DocumentContentTranslationStrategy<
  TSchema extends Schema.Schema<{
    type: DocumentContent['type']
  }>,
> {
  readonly definition: DocumentContentDefinitionBase<TSchema>

  readonly retryContextUpdater: (args: {
    sectionId: string
    sectionDefinition: SectionTranslationDefinition
    currentValidation: ValidationResult
    previousValidation: ValidationResult | undefined
    originalContext: Schema.Schema.Type<TSchema>
    translatedContext: Schema.Schema.Type<TSchema>
  }) => Effect.Effect<TranslationState<TSchema>, TranslationError>
}

export interface TranslationState<
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
> {
  context: Schema.Schema.Type<TSchema>
  validation: ValidationResult
}
