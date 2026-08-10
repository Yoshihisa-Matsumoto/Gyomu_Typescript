import type { LanguageCodes, Section } from '@gyomu/schema/schemas/document'

/**
 * Represents a document that has been translated, containing the target language and the resulting translated sections.
 */
export interface TranslatedDocument {
  /**
   * The target language code for the translation.
   */
  readonly language: LanguageCodes

  /**
   * The destination sections where the translated content will be placed.
   */
  readonly sections: ReadonlyArray<Section>
}
