import type { LanguageCodes } from '../../schemas/document/TranslationTarget.js'

export const LLM_CONTEXT_SECTION_IDS = [
  'overview',
  'architecture',
  'repository-structure',
  'package-responsibilities',
  'design-principles',
  'coding-guidelines',
  'public-api',
  'common-workflows',
  'important-constraints',
  'editing-rules',
] as const

export type LlmContextSectionId = (typeof LLM_CONTEXT_SECTION_IDS)[number]

type SectionDictionaryItem = {
  [section in LlmContextSectionId]: string
}

export const LLM_CONTEXT_SECTION_TITLES: Record<
  Extract<LanguageCodes, 'en'>,
  SectionDictionaryItem
> = {
  en: {
    overview: 'Repository Overview',
    architecture: 'Architecture',
    'repository-structure': 'Repository Structure',
    'package-responsibilities': 'Package Responsibilities',
    'design-principles': 'Design Principles',
    'coding-guidelines': 'Coding Guidelines',
    'public-api': 'Public API',
    'common-workflows': 'Common Workflows',
    'important-constraints': 'Important Constraints',
    'editing-rules': 'Editing Rules',
  },
}
