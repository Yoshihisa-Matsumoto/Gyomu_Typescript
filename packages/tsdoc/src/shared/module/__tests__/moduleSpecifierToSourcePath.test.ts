import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { moduleSpecifierToSourcePath } from '../moduleSpecifierToSourcePath.js'

describe('moduleSpecifierToSourcePath', () => {
  const projectRoot = path.resolve('/project')

  test('resolves sibling module', () => {
    expect(moduleSpecifierToSourcePath('./User.js', 'src/service/UserService.ts')).toBe(
      'src/service/User.ts',
    )
  })

  test('resolves parent module', () => {
    expect(moduleSpecifierToSourcePath('../model/User.js', 'src/service/UserService.ts')).toBe(
      'src/model/User.ts',
    )
  })

  test('resolves nested parent path', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../../shared/types/User.js',
        'src/service/internal/UserService.ts',
      ),
    ).toBe('src/shared/types/User.ts')
  })

  test('normalizes mjs extension', () => {
    expect(moduleSpecifierToSourcePath('../model/User.mjs', 'src/service/UserService.ts')).toBe(
      'src/model/User.ts',
    )
  })

  test('normalizes cjs extension', () => {
    expect(moduleSpecifierToSourcePath('../model/User.cjs', 'src/service/UserService.ts')).toBe(
      'src/model/User.ts',
    )
  })

  test('keeps ts extension unchanged', () => {
    expect(moduleSpecifierToSourcePath('../model/User.ts', 'src/service/UserService.ts')).toBe(
      'src/model/User.ts',
    )
  })
})
