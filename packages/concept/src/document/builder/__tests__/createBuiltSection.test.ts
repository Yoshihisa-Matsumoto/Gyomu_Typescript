import { describe, expect, it } from 'vitest'
import {
  BulletListTranslationStrategy,
  CodeBlockTranslationStrategy,
  ParagraphTranslationStrategy,
  TableTranslationStrategy,
} from '@gyomu/ai-compiler/translation'
import { createBuiltSection } from '../createBuiltSection.js'
import type { SectionWithInstruction } from '@gyomu/schema/document'

describe('createBuiltSection', () => {
  it('creates a non-translated BuiltSection when translation is not specified', () => {
    const input: SectionWithInstruction = {
      section: {
        id: 'overview',
        title: 'Overview',
        contents: [
          {
            type: 'paragraph',
            text: 'Hello',
          },
        ],
      },
      translationInstruction: 'Translate naturally.',
    }

    const result = createBuiltSection(input)

    expect(result).toEqual({
      section: input.section,
      translation: {
        strategy: 'none',
      },
    })
  })

  it('creates a translated BuiltSection when translation is specified', () => {
    const input: SectionWithInstruction = {
      section: {
        id: 'overview',
        title: 'Overview',
        contents: [
          {
            type: 'paragraph',
            text: 'Hello',
          },
        ],
      },
      translationInstruction: 'Translate naturally.',
    }

    const result = createBuiltSection(input, {} as never)

    expect(result).toEqual({
      section: input.section,
      translation: {
        strategy: 'translate',
        translationInstruction: 'Translate naturally.',
        translations: [ParagraphTranslationStrategy],
      },
    })
  })

  it('creates translation strategies corresponding to each content type', () => {
    const input: SectionWithInstruction = {
      section: {
        id: 'mixed-content',
        title: 'Mixed Content',
        contents: [
          {
            type: 'paragraph',
            text: 'Paragraph',
          },
          {
            type: 'bullet-list',
            items: [
              { translationId: 1, text: 'Item 1' },
              { translationId: 2, text: 'Item 2' },
            ],
          },
          {
            type: 'code',
            language: 'typescript',
            code: 'const value = 1',
          },
          {
            type: 'table',
            header: { cells: ['Name', 'Value'] },
            rows: [{ cells: ['foo', 'bar'] }],
          },
        ],
      },
    }

    const result = createBuiltSection(input, {} as never)

    expect(result.translation).toEqual({
      strategy: 'translate',
      translationInstruction: undefined,
      translations: [
        ParagraphTranslationStrategy,
        BulletListTranslationStrategy,
        CodeBlockTranslationStrategy,
        TableTranslationStrategy,
      ],
    })
  })

  it('preserves the original section', () => {
    const input: SectionWithInstruction = {
      section: {
        id: 'overview',
        title: 'Overview',
        contents: [
          {
            type: 'paragraph',
            text: 'Hello',
          },
        ],
      },
    }

    const result = createBuiltSection(input)

    expect(result.section).toBe(input.section)
  })

  it('preserves translation instruction', () => {
    const input: SectionWithInstruction = {
      section: {
        id: 'overview',
        title: 'Overview',
        contents: [
          {
            type: 'paragraph',
            text: 'Hello',
          },
        ],
      },
      translationInstruction: 'Preserve technical terms.',
    }

    const result = createBuiltSection(input, {} as never)

    expect(result.translation).toEqual({
      strategy: 'translate',
      translationInstruction: 'Preserve technical terms.',
      translations: [ParagraphTranslationStrategy],
    })
  })
})
