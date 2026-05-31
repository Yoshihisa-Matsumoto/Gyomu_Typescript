import { describe, expect, test } from 'vitest'

import { parseProtectedRegions } from '../parseProtectedRegions.js'

describe('parseProtectedRegions', () => {
  test('extracts single protected region', () => {
    const text = `
/**
 * hello
 *
 * <!-- tsdoc-preserve-start -->
 * custom content
 * <!-- tsdoc-preserve-end -->
 */
`

    const result = parseProtectedRegions(text)

    expect(result).toHaveLength(1)

    expect(result[0]).toEqual({
      start: expect.any(Number),
      end: expect.any(Number),
      content: 'custom content',
    })
  })

  test('extracts multiple protected regions', () => {
    const text = `
/**
 * <!-- tsdoc-preserve-start -->
 * first
 * <!-- tsdoc-preserve-end -->
 *
 * something
 *
 * <!-- tsdoc-preserve-start -->
 * second
 * <!-- tsdoc-preserve-end -->
 */
`

    const result = parseProtectedRegions(text)

    expect(result).toHaveLength(2)

    expect(result[0]?.content).toContain('first')
    expect(result[1]?.content).toContain('second')
  })

  test('returns empty array when no protected region exists', () => {
    const text = `
/**
 * normal docs
 */
`

    const result = parseProtectedRegions(text)

    expect(result).toEqual([])
  })

  test('ignores malformed region without end marker', () => {
    const text = `
/**
 * <!-- tsdoc-preserve-start -->
 * broken
 */
`

    const result = parseProtectedRegions(text)

    expect(result).toEqual([])
  })

  test('extracts empty protected region', () => {
    const text = `
/**
 * <!-- tsdoc-preserve-start -->
 * <!-- tsdoc-preserve-end -->
 */
`

    const result = parseProtectedRegions(text)

    expect(result).toHaveLength(1)

    expect(result[0]?.content).toBe('')
  })

  test('preserves region ordering', () => {
    const text = `
/**
 * <!-- tsdoc-preserve-start -->
 * first
 * <!-- tsdoc-preserve-end -->
 *
 * <!-- tsdoc-preserve-start -->
 * second
 * <!-- tsdoc-preserve-end -->
 */
`

    const result = parseProtectedRegions(text)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(result[0]!.start).toBeLessThan(result[1]!.start)
  })
})
