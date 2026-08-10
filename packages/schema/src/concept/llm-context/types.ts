import type { LanguageCodes } from '../../schemas/document/TranslationTarget.js'

/**
 * An array containing the valid section identifiers for the LLM context, used for structuring repository documentation.
 */
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
  'navigation',
] as const

/**
 * Represents a valid identifier for an LLM context documentation section, derived from LLM_CONTEXT_SECTION_IDS.
 */
export type LlmContextSectionId = (typeof LLM_CONTEXT_SECTION_IDS)[number]

type SectionDictionaryItem = {
  [section in LlmContextSectionId]: string
}

/**
 * A dictionary mapping LLM context section identifiers to their human-readable titles, currently defined for English.
 */
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
    navigation: 'Navigation',
  },
}
