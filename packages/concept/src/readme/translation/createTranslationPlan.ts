import type { LanguageCodes, Section, TranslationTarget } from '@gyomu/schema/schemas/document'
import type { TranslationPlan } from './TranslationPlan.js'

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
