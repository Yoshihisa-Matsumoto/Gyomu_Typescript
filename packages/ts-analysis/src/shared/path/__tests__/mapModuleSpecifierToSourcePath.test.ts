import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { mapModuleSpecifierToSourcePath } from '../mapModuleSpecifierToSourcePath.js'

describe('mapModuleSpecifierToSourcePath', () => {
  const projectRoot = path.resolve('/project')

  test('resolves sibling module', () => {
    expect(
      mapModuleSpecifierToSourcePath(
        './User.js',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/service/User.ts')
  })

  test('resolves parent module', () => {
    expect(
      mapModuleSpecifierToSourcePath(
        '../model/User.js',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/model/User.ts')
  })

  test('resolves nested parent path', () => {
    expect(
      mapModuleSpecifierToSourcePath(
        '../../shared/types/User.js',
        ProjectRelativePath('src/service/internal/UserService.ts'),
      ),
    ).toBe('src/shared/types/User.ts')
  })

  test('normalizes mjs extension', () => {
    expect(
      mapModuleSpecifierToSourcePath(
        '../model/User.mjs',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/model/User.ts')
  })

  test('normalizes cjs extension', () => {
    expect(
      mapModuleSpecifierToSourcePath(
        '../model/User.cjs',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/model/User.ts')
  })

  test('keeps ts extension unchanged', () => {
    expect(
      mapModuleSpecifierToSourcePath(
        '../model/User.ts',
        ProjectRelativePath('src/service/UserService.ts'),
      ),
    ).toBe('src/model/User.ts')
  })
})
