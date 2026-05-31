import { describe, expect, test } from 'vitest'
import { normalizeJsDocText } from '../normalizeJsDocText.js'

describe('normalizeJsDocText', () => {
  test('normalizes CRLF to LF', () => {
    const input = 'line1\r\nline2\r\nline3'

    expect(normalizeJsDocText(input)).toBe('line1\nline2\nline3')
  })

  test('removes leading jsdoc stars', () => {
    const input = `
      * line1
      * line2
      * line3
    `

    expect(normalizeJsDocText(input)).toBe('line1\nline2\nline3')
  })

  test('removes leading spaces before stars', () => {
    const input = `
          * line1
        * line2
      * line3
    `

    expect(normalizeJsDocText(input)).toBe('line1\nline2\nline3')
  })

  test('keeps lines without leading stars', () => {
    const input = `
      line1
      line2
    `

    expect(normalizeJsDocText(input)).toBe('line1\n      line2')
  })

  test('trims leading and trailing whitespace', () => {
    const input = `

      * hello

    `

    expect(normalizeJsDocText(input)).toBe('hello')
  })

  test('handles mixed content', () => {
    const input = `
      * hello
      * world
      plain
    `

    expect(normalizeJsDocText(input)).toBe('hello\nworld\n      plain')
  })

  test('removes star only at line start', () => {
    const input = `
      * hello * world
    `

    expect(normalizeJsDocText(input)).toBe('hello * world')
  })

  test('supports empty string', () => {
    expect(normalizeJsDocText('')).toBe('')
  })

  test('removes jsdoc block markers', () => {
    const input = `
    /**
     * hello
     * world
     */
  `

    expect(normalizeJsDocText(input)).toBe('hello\nworld')
  })
})
