import {
  BulletListTranslationStrategy,
  CodeBlockTranslationStrategy,
  ParagraphTranslationStrategy,
  TableTranslationStrategy,
} from '@gyomu/ai-compiler/translation'
import type {
  BuiltSection,
  SectionTranslationDefinition,
  SectionWithInstruction,
} from '@gyomu/schema/document'

/**
 * Creates a BuiltSection from a section with translation instructions.
 *
 * @param input The section containing content and translation instructions.
 *
 * @param translation Optional translation definitions to apply.
 *
 * @returns A constructed BuiltSection object.
 */
export const createBuiltSection = (
  input: SectionWithInstruction,
  translation?: SectionTranslationDefinition,
): BuiltSection => {
  if (translation)
    return {
      section: input.section,
      translation: {
        strategy: 'translate',
        translationInstruction: input.translationInstruction,
        translations: input.section.contents.map((content) => {
          switch (content.type) {
            case 'paragraph':
              return ParagraphTranslationStrategy
            case 'bullet-list':
              return BulletListTranslationStrategy
            case 'code':
              return CodeBlockTranslationStrategy
            case 'table':
              return TableTranslationStrategy
          }
        }),
      },
    }
  return { section: input.section, translation: { strategy: 'none' } }
}
