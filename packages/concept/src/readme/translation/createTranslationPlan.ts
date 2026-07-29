import type { LanguageCodes, Section, TranslationTarget } from '@gyomu/schema/schemas/document'
import type { TranslationPlan } from './TranslationPlan.js'

/**
 * Creates a translation plan for a specific language by mapping target translations to sections.
 *
 * @param language The target language code for the translation.
 *
 * @param targets A collection of translation targets to process.
 *
 * @param sections The original sections to be translated.
 *
 * @returns A TranslationPlan object containing the language, target list, and the cloned sections for destination.
 */
export const createTranslationPlan = (
  language: LanguageCodes,
  targets: ReadonlyArray<TranslationTarget>,
  sections: ReadonlyArray<Section>,
): TranslationPlan => {
  const destination = [...structuredClone(sections)]

  return {
    language,
    destination,
    targets,
  }
}
