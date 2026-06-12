import { describe, expect, test } from 'vitest'
import { detectManualFormatting } from '../detectManualFormatting.js'
import type { HumanEditContext } from '@gyomu/schema/typescript'

describe('detectManualFormatting', () => {
  const context: HumanEditContext = {
    source: 'summary',
  }

  test('returns empty array for normal text', () => {
    expect(detectManualFormatting('This is a normal sentence.', context)).toEqual([])
  })

  test('detects aligned spacing', () => {
    expect(detectManualFormatting('name  value', context)).toEqual([
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'aligned space',
          source: 'summary',
        },
      },
    ])
  })

  test('detects ascii art', () => {
    expect(detectManualFormatting('┌─────┐', context)).toEqual([
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'ascii-art',
          source: 'summary',
        },
      },
    ])
  })

  test('detects markdown quote style as ascii art', () => {
    expect(detectManualFormatting('>>>>>>', context)).toEqual([
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'ascii-art',
          source: 'summary',
        },
      },
    ])
  })

  test('detects indentation', () => {
    expect(detectManualFormatting('    deeply indented', context)).toEqual([
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'indentation',
          source: 'summary',
        },
      },
    ])
  })

  test('detects decorative separators', () => {
    expect(detectManualFormatting('-----', context)).toEqual([
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'decorative separators',
          source: 'summary',
        },
      },
    ])
  })

  test('includes tagName when provided', () => {
    const tagContext: HumanEditContext = {
      source: 'tag',
      tagName: 'remarks',
    }

    expect(detectManualFormatting('name  value', tagContext)).toEqual([
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'aligned space',
          source: 'tag',
          tagName: 'remarks',
        },
      },
    ])
  })

  test('detects multiple patterns', () => {
    expect(
      detectManualFormatting(
        `
name  value
┌─────┐
    indented
-----
        `,
        context,
      ),
    ).toEqual([
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'aligned space',
          source: 'summary',
        },
      },
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'ascii-art',
          source: 'summary',
        },
      },
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'indentation',
          source: 'summary',
        },
      },
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          pattern: 'decorative separators',
          source: 'summary',
        },
      },
    ])
  })

  test('ignores empty lines for ascii art detection', () => {
    expect(detectManualFormatting('\n\n', context)).toEqual([])
  })
})
