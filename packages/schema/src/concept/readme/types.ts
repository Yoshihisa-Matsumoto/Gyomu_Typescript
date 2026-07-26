import type { LanguageCodes } from '../../schemas/document/TranslationTarget.js'

/**
 * An array of valid identifiers for sections allowed in a README.
 */
export const README_SECTION_IDS = [
  'overview',
  'features',
  'installation',
  'requirements',
  'quick-start',
  'architecture',
  'public-api',
  'development',
  'dependencies',
  'license',
] as const

/**
 * A union type representing a valid README section identifier.
 */
export type ReadmeSectionId = (typeof README_SECTION_IDS)[number]

type SectionDictionaryItem = {
  [section in ReadmeSectionId]: string
}

/**
 * A localized dictionary of README section titles mapped by language code.
 */
export const README_SECTION_TITLES: Record<LanguageCodes, SectionDictionaryItem> = {
  en: {
    overview: 'Overview',
    features: 'Features',
    installation: 'Installation',
    'public-api': 'Public API',
    'quick-start': 'Quick Start',
    architecture: 'Architecture',
    dependencies: 'Dependencies',
    development: 'Development',
    license: 'License',
    requirements: 'Requirements',
  },
  ja: {
    overview: '概要',
    features: '機能',
    installation: 'インストール',
    'public-api': 'Public API',
    'quick-start': 'クイックスタート',
    architecture: 'アーキテクチャ',
    dependencies: '依存関係',
    development: '開発',
    license: 'ライセンス',
    requirements: '要件',
  },
}

/**
 * A map of language codes to their corresponding display names or link labels.
 */
export const README_LINK: Record<LanguageCodes, string> = {
  en: 'US English',
  ja: 'JP 日本語',
}
