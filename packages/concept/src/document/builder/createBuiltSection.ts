import {
  BulletListTranslationStrategy,
  CodeBlockTranslationStrategy,
  ParagraphTranslationStrategy,
  TableTranslationStrategy,
} from '@gyomu/ai-compiler/translation'
import type { BuiltSection, SectionWithInstruction } from '@gyomu/schema/document'

export const createBuiltSection = (input: SectionWithInstruction): BuiltSection => {
  return {
    section: input.section,
    translation: {
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
}
