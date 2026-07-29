import { describe, expect, it } from 'vitest'
import { collectTransationTargets } from '../collectTranslationTargets.js'
import type { Section, TranslationTarget } from '@gyomu/schema/schemas/document'

describe('collectTranslationTargets', () => {
  it('title', () => {
    const sections: ReadonlyArray<Section> = [
      {
        id: 'overview',
        title: 'Overview',
        contents: [],
      },
    ]
    const result = collectTransationTargets(sections)
    expect(result).toMatchObject([
      {
        id: 'overview.title',
        source: 'Overview',
        location: {
          sectionId: 'overview',
          path: ['title'],
        },
      } satisfies TranslationTarget,
    ])
  })
  it('paragraph', () => {
    const sections: ReadonlyArray<Section> = [
      {
        id: 'overview',
        contents: [{ type: 'paragraph', text: 'PARAGRAPH' }],
      },
    ]
    const result = collectTransationTargets(sections)
    expect(result).toMatchObject([
      {
        id: 'overview.contents.0.text',
        source: 'PARAGRAPH',
        location: {
          sectionId: 'overview',
          path: ['contents', 0, 'text'],
        },
      } satisfies TranslationTarget,
    ])
  })
  it('bullets', () => {
    const sections: ReadonlyArray<Section> = [
      {
        id: 'overview',
        contents: [{ type: 'bullet-list', items: ['ITEM1', 'ITEM2'] }],
      },
    ]
    const result = collectTransationTargets(sections)
    expect(result).toMatchObject([
      {
        id: 'overview.contents.0.items.0',
        source: 'ITEM1',
        location: {
          sectionId: 'overview',
          path: ['contents', 0, 'items', 0],
        },
      } satisfies TranslationTarget,
      {
        id: 'overview.contents.0.items.1',
        source: 'ITEM2',
        location: {
          sectionId: 'overview',
          path: ['contents', 0, 'items', 1],
        },
      } satisfies TranslationTarget,
    ])
  })
  it('code title', () => {
    const sections: ReadonlyArray<Section> = [
      {
        id: 'overview',
        contents: [{ type: 'code', code: 'IMPort test', language: 'c#', title: 'CODETITLE' }],
      },
    ]
    const result = collectTransationTargets(sections)
    expect(result).toMatchObject([
      {
        id: 'overview.contents.0.title',
        source: 'CODETITLE',
        location: {
          sectionId: 'overview',
          path: ['contents', 0, 'title'],
        },
      } satisfies TranslationTarget,
    ])
  })
  it('mix', () => {
    const section: ReadonlyArray<Section> = [
      {
        id: 'overview',
        title: 'Overview',
        contents: [
          {
            type: 'paragraph',
            text: 'This package provides shared utilities for the project.',
          },
          {
            type: 'bullet-list',
            items: ['Provides common type definitions.', 'Provides reusable Effect services.'],
          },
          {
            type: 'code',
            language: 'ts',
            title: 'Example Usage',
            code: `
import { Service } from '@gyomu/core'

const service = Service.make()
      `.trim(),
          },
        ],
      },
    ]
    const result = collectTransationTargets(section)

    expect(result).toEqual(
      expect.arrayContaining([
        {
          source: 'Overview',
          location: {
            sectionId: 'overview',
            path: ['title'],
          },
          id: 'overview.title',
        },
        {
          source: 'This package provides shared utilities for the project.',
          location: {
            sectionId: 'overview',
            path: ['contents', 0, 'text'],
          },
          id: 'overview.contents.0.text',
        },
        {
          source: 'Provides common type definitions.',
          location: {
            sectionId: 'overview',
            path: ['contents', 1, 'items', 0],
          },
          id: 'overview.contents.1.items.0',
        },
        {
          source: 'Provides reusable Effect services.',
          location: {
            sectionId: 'overview',
            path: ['contents', 1, 'items', 1],
          },
          id: 'overview.contents.1.items.1',
        },
        {
          source: 'Example Usage',
          location: {
            sectionId: 'overview',
            path: ['contents', 2, 'title'],
          },
          id: 'overview.contents.2.title',
        },
      ]),
    )
  })
})
