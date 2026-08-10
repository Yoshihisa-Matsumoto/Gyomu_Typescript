import type { TranslationError } from '../error/TranslationError.js'
import type {
  DocumentContentDefinitionBase,
  ValidationResult,
} from './DocumentContentDefinitionBase.js'
import type { SectionTranslationDefinition } from './SectionTranslationDefinition.js'
import type { DocumentContent } from '../schemas/document/DocumentContent.js'
import type { Effect, Schema } from 'effect'

/**
 * Defines a strategy for translating document content, including the definition and logic for updating the translation context upon validation failure.
 */
export interface DocumentContentTranslationStrategy<
  TSchema extends Schema.Schema<{
    type: DocumentContent['type']
  }>,
> {
  /**
   * The base definition for the document content associated with the schema.
   */
  readonly definition: DocumentContentDefinitionBase<TSchema>

  /**
   * Updates the translation context for a given section when validation fails.
   *
   * @param args The context object containing section identifiers, current and previous validation results, and the original and translated schemas.
   *
   * @returns An effect that resolves to the updated translation state or a translation error.
   */
  readonly retryContextUpdater: (args: {
    sectionId: string
    sectionDefinition: SectionTranslationDefinition
    currentValidation: ValidationResult
    previousValidation: ValidationResult | undefined
    originalContext: Schema.Schema.Type<TSchema>
    translatedContext: Schema.Schema.Type<TSchema>
  }) => Effect.Effect<TranslationState<TSchema>, TranslationError>
}

/**
 * Represents the state of a document translation, holding the current schema-based context and validation result.
 */
export interface TranslationState<
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
> {
  /**
   * The current schema-typed context.
   */
  context: Schema.Schema.Type<TSchema>

  /**
   * The validation result of the translation.
   */
  validation: ValidationResult
}
