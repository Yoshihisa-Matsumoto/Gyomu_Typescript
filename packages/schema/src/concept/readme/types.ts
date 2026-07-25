import type { LanguageCodes } from '../../schemas/document/TranslationTarget.js'

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

export type ReadmeSectionId = (typeof README_SECTION_IDS)[number]

type SectionDictionaryItem = {
  [section in ReadmeSectionId]: string
}

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

export const README_LINK: Record<LanguageCodes, string> = {
  en: 'US English',
  ja: 'JP 日本語',
}
