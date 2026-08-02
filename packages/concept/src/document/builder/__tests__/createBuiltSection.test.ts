import { describe, expect, it } from 'vitest'
import {
  BulletListTranslationStrategy,
  CodeBlockTranslationStrategy,
  ParagraphTranslationStrategy,
  TableTranslationStrategy,
} from '@gyomu/ai-compiler/translation'
import { createBuiltSection } from '../createBuiltSection.js'
import type { Section } from '@gyomu/schema/schemas/document'

describe('createBuiltSection', () => {
  it('should create BuiltSection with all translation strategies', () => {
    const section: Section = {
      id: 'overview',
      contents: [
        {
          type: 'paragraph',
          text: 'paragraph',
        },
        {
          type: 'bullet-list',
          items: [],
        },
        {
          type: 'code',
          language: 'ts',
          code: 'const a = 1',
        },
        {
          type: 'table',
          header: { cells: [] },
          rows: [],
        },
      ],
    }

    const result = createBuiltSection({
      section,
      translationInstruction: 'translate naturally',
    })

    expect(result).toEqual({
      section,
      translation: {
        translationInstruction: 'translate naturally',
        translations: [
          ParagraphTranslationStrategy,
          BulletListTranslationStrategy,
          CodeBlockTranslationStrategy,
          TableTranslationStrategy,
        ],
      },
    })
  })

  it('should preserve section reference', () => {
    const section: Section = {
      id: 'overview',
      contents: [],
    }

    const result = createBuiltSection({ section })

    expect(result.section).toBe(section)
  })

  it('should allow undefined translationInstruction', () => {
    const section: Section = {
      id: 'overview',
      contents: [
        {
          type: 'paragraph',
          text: 'Hello',
        },
      ],
    }

    const result = createBuiltSection({ section })

    expect(result.translation.translationInstruction).toBeUndefined()
    expect(result.translation.translations).toEqual([ParagraphTranslationStrategy])
  })

  it('should preserve content order when creating translation strategies', () => {
    const section: Section = {
      id: 'overview',
      contents: [
        {
          type: 'code',
          language: 'ts',
          code: '',
        },
        {
          type: 'paragraph',
          text: '',
        },
        {
          type: 'table',
          header: { cells: [] },
          rows: [],
        },
        {
          type: 'bullet-list',
          items: [],
        },
      ],
    }

    const result = createBuiltSection({ section })

    expect(result.translation.translations).toEqual([
      CodeBlockTranslationStrategy,
      ParagraphTranslationStrategy,
      TableTranslationStrategy,
      BulletListTranslationStrategy,
    ])
  })
})
