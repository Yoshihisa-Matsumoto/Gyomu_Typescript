import { describe, expect, test } from 'vitest'
import { detectNonGeneratedTag } from '../detectNonGeneratedTag.js'
import type { HumanEditContext, ParsedTag } from '../../../jsdoc/ParsedJsDoc.js'

const context: HumanEditContext = {
  source: 'tag',
}
describe('detectNonGeneratedTag', () => {
  test.each(['param', 'returns', 'remarks', 'example', 'throws', 'template', 'deprecated'])(
    'returns undefined for known tag: %s',
    (tagName) => {
      const tag: ParsedTag = {
        tagName,
        text: '',
        sortOrder: 1,
      }

      expect(detectNonGeneratedTag(tag, context)).toEqual([])
    },
  )

  test('detects unknown tag', () => {
    const tag: ParsedTag = {
      tagName: 'customTag',
      text: '',
      sortOrder: 1,
    }

    expect(detectNonGeneratedTag(tag, context)).toEqual([
      {
        type: 'non-generated-tag',
        score: 0.4,
        details: {
          tagName: 'customTag',
        },
      },
    ])
  })

  test('detects tsdoc tag', () => {
    const tag: ParsedTag = {
      tagName: 'see',
      text: '',
      sortOrder: 1,
    }

    expect(detectNonGeneratedTag(tag, context)).toEqual([
      {
        type: 'non-generated-tag',
        score: 0.4,
        details: {
          tagName: 'see',
        },
      },
    ])
  })

  test('detects empty tag name', () => {
    const tag: ParsedTag = {
      tagName: '',
      text: '',
      sortOrder: 1,
    }

    expect(detectNonGeneratedTag(tag, context)).toEqual([
      {
        type: 'non-generated-tag',
        score: 0.4,
        details: {
          tagName: '',
        },
      },
    ])
  })

  test('matches tag names case-sensitively', () => {
    const tag: ParsedTag = {
      tagName: 'Param',
      text: '',
      sortOrder: 1,
    }

    expect(detectNonGeneratedTag(tag, context)).toEqual([
      {
        type: 'non-generated-tag',
        score: 0.4,
        details: {
          tagName: 'Param',
        },
      },
    ])
  })
})
