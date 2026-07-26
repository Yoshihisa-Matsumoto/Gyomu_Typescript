import type { LanguageCodes, Section, TranslationTarget } from '@gyomu/schema/schemas/document'

export interface TranslationPlan {
  readonly language: LanguageCodes

  readonly targets: ReadonlyArray<TranslationTarget>

  readonly destination: Array<Section>
}
