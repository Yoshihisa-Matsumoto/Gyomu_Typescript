import { describe, expect, test } from 'vitest'

import { normalizeModuleSpecifier } from '../normalizeModuleSpecifier.js'

describe('normalizeModuleSpecifier', () => {
  test.each([
    ['./User.js', './User.ts'],
    ['./User.mjs', './User.ts'],
    ['./User.cjs', './User.ts'],
    ['../model/User.js', '../model/User.ts'],
    ['../../shared/index.mjs', '../../shared/index.ts'],
  ])('converts %s to %s', (input, expected) => {
    expect(normalizeModuleSpecifier(input)).toBe(expected)
  })

  test.each(['./User.ts', './User.tsx', './User.d.ts', 'node:path', '@gyomu/schema', 'effect'])(
    'does not modify %s',
    (input) => {
      expect(normalizeModuleSpecifier(input)).toBe(input)
    },
  )
})
