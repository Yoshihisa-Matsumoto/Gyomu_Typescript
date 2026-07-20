import { describe, expect, test } from 'vitest'
import { detectComplexMarkdown } from '../detectComplexMarkdown.js'
import type { HumanEditContext } from '@gyomu/schema/schemas/typescript'

describe('detectComplexMarkdown', () => {
  const context: HumanEditContext = {
    source: 'summary',
  }

  test('returns empty array for plain text', () => {
    expect(detectComplexMarkdown('This is a normal sentence.', context)).toEqual([])
  })

  test('detects markdown heading', () => {
    expect(detectComplexMarkdown('# Heading', context)).toEqual([
      {
        type: 'complex-markdown',
        score: 0.6,
        details: {
          pattern: 'start with #',
          source: 'summary',
          targetSection: 'summary',
        },
      },
    ])
  })

  test('detects heading with leading spaces', () => {
    expect(detectComplexMarkdown('   ## Heading', context)).toEqual([
      {
        type: 'complex-markdown',
        score: 0.6,
        details: {
          pattern: 'start with #',
          source: 'summary',
          targetSection: 'summary',
        },
      },
    ])
  })

  test('detects code fence', () => {
    expect(detectComplexMarkdown('```ts\nconst x = 1\n```', context)).toEqual([
      {
        type: 'complex-markdown',
        score: 0.6,
        details: {
          pattern: '```',
          source: 'summary',
          targetSection: 'summary',
        },
      },
    ])
  })

  test('detects both heading and code fence', () => {
    expect(
      detectComplexMarkdown(
        `
# Example

\`\`\`ts
const x = 1
\`\`\`
        `,
        context,
      ),
    ).toEqual([
      {
        type: 'complex-markdown',
        score: 0.6,
        details: {
          pattern: 'start with #',
          source: 'summary',
          targetSection: 'summary',
        },
      },
      {
        type: 'complex-markdown',
        score: 0.6,
        details: {
          pattern: '```',
          source: 'summary',
          targetSection: 'summary',
        },
      },
    ])
  })

  test('does not detect inline # usage', () => {
    expect(detectComplexMarkdown('value # comment', context)).toEqual([])
  })

  test('does not detect inline code fence usage', () => {
    expect(detectComplexMarkdown('Use ``` for code fences', context)).toEqual([])
  })

  test('returns empty array for empty string', () => {
    expect(detectComplexMarkdown('', context)).toEqual([])
  })

  test('includes tagName when provided', () => {
    const tagContext: HumanEditContext = {
      source: 'tag',
      tagName: 'remarks',
    }

    expect(detectComplexMarkdown('# Heading', tagContext)).toEqual([
      {
        type: 'complex-markdown',
        score: 0.6,
        details: {
          pattern: 'start with #',
          source: 'tag',
          targetSection: 'tag:remarks',
        },
      },
    ])
  })
})
