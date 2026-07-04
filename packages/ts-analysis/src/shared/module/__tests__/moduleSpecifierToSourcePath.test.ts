import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { moduleSpecifierToSourcePath } from '../moduleSpecifierToSourcePath.js'

describe('moduleSpecifierToSourcePath', () => {
  const projectRoot = path.resolve('/project')

  test('resolves sibling module', () => {
    expect(
      moduleSpecifierToSourcePath('./User.js', ProjectRelativePath('src/service/UserService.ts')),
    ).toBe('src/service/User.ts')
  })

  test('resolves parent module', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../model/User.js',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/model/User.ts')
  })

  test('resolves nested parent path', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../../shared/types/User.js',
        ProjectRelativePath('src/service/internal/UserService.ts'),
      ),
    ).toBe('src/shared/types/User.ts')
  })

  test('normalizes mjs extension', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../model/User.mjs',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/model/User.ts')
  })

  test('normalizes cjs extension', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../model/User.cjs',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/model/User.ts')
  })

  test('keeps ts extension unchanged', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../model/User.ts',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/model/User.ts')
  })
})
