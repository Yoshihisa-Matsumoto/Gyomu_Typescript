import type { LanguageCodes, Section, TranslationTarget } from '@gyomu/schema/schemas/document'

/**
 * Defines a plan for translating README content into a specific language, including target source files and destination document sections.
 */
export interface TranslationPlan {
  /**
   * The target language code for the translation.
   */
  readonly language: LanguageCodes

  /**
   * A collection of translation targets, representing source content to be translated.
   */
  readonly targets: ReadonlyArray<TranslationTarget>

  /**
   * The destination sections where the translated content will be placed.
   */
  readonly destination: Array<Section>
}
