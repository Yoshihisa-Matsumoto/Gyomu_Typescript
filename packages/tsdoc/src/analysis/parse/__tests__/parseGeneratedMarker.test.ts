import { describe, expect, test } from 'vitest'
import { extractGeneratorMarker, parseGeneratedMarker } from '../parseGeneratedMarker.js'

describe('extractGeneratorMarker', () => {
  test('extracts marker from surrounding text', () => {
    expect(
      extractGeneratorMarker(`
        some text
        @GeneratedBy(ChatGPT@5.5)
        other text
      `),
    ).toBe('@GeneratedBy(ChatGPT@5.5)')
  })

  test('returns undefined when marker does not exist', () => {
    expect(extractGeneratorMarker('hello world')).toBeUndefined()
  })

  test('returns undefined for empty input', () => {
    expect(extractGeneratorMarker('')).toBeUndefined()
  })
})

describe('parseGeneratedMarker', () => {
  test('parses tool name only', () => {
    expect(parseGeneratedMarker('@GeneratedBy(ChatGPT)')).toEqual({
      tool: 'ChatGPT',
      raw: '@GeneratedBy(ChatGPT)',
    })
  })

  test('parses tool name and version', () => {
    expect(parseGeneratedMarker('@GeneratedBy(ChatGPT@5.5)')).toEqual({
      tool: 'ChatGPT',
      version: '5.5',
      raw: '@GeneratedBy(ChatGPT@5.5)',
    })
  })

  test('supports hyphen and dot in version', () => {
    expect(parseGeneratedMarker('@GeneratedBy(Cursor@1.2.3-beta)')).toEqual({
      tool: 'Cursor',
      version: '1.2.3-beta',
      raw: '@GeneratedBy(Cursor@1.2.3-beta)',
    })
  })

  test('returns undefined when tool name is empty', () => {
    expect(parseGeneratedMarker('@GeneratedBy()')).toBeUndefined()
  })

  test('returns undefined for malformed marker', () => {
    expect(parseGeneratedMarker('@GeneratedBy(ChatGPT')).toBeUndefined()
  })

  test('does not allow @ inside tool name', () => {
    expect(parseGeneratedMarker('@GeneratedBy(Chat@GPT@5.5)')).toBeUndefined()
  })

  test('does not allow parentheses inside tool name', () => {
    expect(parseGeneratedMarker('@GeneratedBy(Chat(GPT))')).toBeUndefined()
  })
})
