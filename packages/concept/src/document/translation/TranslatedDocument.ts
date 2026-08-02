import type { LanguageCodes, Section } from '@gyomu/schema/schemas/document'

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
