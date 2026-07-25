import { Schema } from 'effect'

/**
 * Defines location information used to pinpoint the exact position of a translation target within a README section.
 */
export const SectionLocationSchema = Schema.Struct({
  sectionId: Schema.String.annotate({
    identifier: 'SectionId',
    description: 'Identifier of the README section containing the translation target.',
  }),

  path: Schema.Array(Schema.Union([Schema.String, Schema.Number])).annotate({
    description:
      'Path to the target value inside the section. Each element represents an object key or array index.',
  }),
}).annotate({
  identifier: 'SectionLocation',
  description:
    'Location information used to identify the exact position of a translation target within a README section.',
})

/**
 * Represents location information identifying the position of a translation target within a README section.
 */
export type SectionLocation = Schema.Schema.Type<typeof SectionLocationSchema>

/**
 * Defines a text fragment extracted from a README section that requires translation.
 */
export const TranslationTargetSchema = Schema.Struct({
  id: Schema.String.annotate({
    description:
      'Unique identifier of the translation target. Used to associate source text with translated text.',
  }),

  source: Schema.String.annotate({
    description: 'Original text before translation.',
  }),

  location: SectionLocationSchema.annotate({
    description: 'Location where the translated text should be applied.',
  }),
}).annotate({
  identifier: 'TranslationTarget',
  description: 'A text fragment extracted from a README section that requires translation.',
})

/**
 * Represents a text fragment extracted from a README section that requires translation.
 */
export type TranslationTarget = Schema.Schema.Type<typeof TranslationTargetSchema>

/**
 * Defines a list of translation results associated with translation targets.
 */
export const TranslationResultSchema = Schema.Array(
  Schema.Struct({
    id: Schema.String.annotate({
      description: 'Identifier of the translation target corresponding to the translated text.',
    }),

    translation: Schema.String.annotate({
      description: 'Translated text generated for the target language.',
    }),
  }).annotate({
    identifier: 'TranslationResult',
    description: 'Translation output associated with a translation target.',
  }),
)

/**
 * Represents the translation output associated with a specific translation target.
 */
export type TranslationResult = Schema.Schema.Type<typeof TranslationResultSchema>

/**
 * An array of language codes supported for translation.
 */
export const SupportedTranslationLanguages = ['en', 'ja'] as const
const LanguageCodeSchema = Schema.Literals(SupportedTranslationLanguages)

/**
 * Represents the set of valid language codes used for translation.
 */
export type LanguageCodes = Schema.Schema.Type<typeof LanguageCodeSchema>

/**
 * Defines the structure of a translation request, including target language and source text fragments.
 */
export const TranslationRequestSchema = Schema.Struct({
  targetLanguage: LanguageCodeSchema.annotate({
    description: 'Target language code for translation. Example: ja, en.',
  }),

  translations: Schema.Array(
    Schema.Struct({
      id: Schema.String.annotate({
        description: 'Stable translation target identifier. Must not be changed.',
      }),

      source: Schema.String.annotate({
        description: 'Original text to translate.',
      }),
    }),
  ),
})

/**
 * Represents a request containing the target language and the collection of text fragments to be translated.
 */
export type TranslationRequest = Schema.Schema.Type<typeof TranslationRequestSchema>
