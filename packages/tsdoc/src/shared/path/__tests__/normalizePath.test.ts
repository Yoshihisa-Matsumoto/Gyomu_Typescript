import { describe, expect, test } from 'vitest'
import { normalizePath } from '../normalizePath.js'

describe('normalizePath', () => {
  test('converts js extension to ts', () => {
    expect(normalizePath('src/user/User.js')).toBe('src/user/User.ts')
  })

  test('does not change ts files', () => {
    expect(normalizePath('src/user/User.ts')).toBe('src/user/User.ts')
  })

  test('does not change mjs files', () => {
    expect(normalizePath('dist/index.mjs')).toBe('dist/index.mjs')
  })

  test('does not change cjs files', () => {
    expect(normalizePath('dist/index.cjs')).toBe('dist/index.cjs')
  })
})
