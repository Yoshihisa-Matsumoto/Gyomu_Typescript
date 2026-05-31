import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { moduleSpecifierToSourcePath } from '../moduleSpecifierToSourcePath.js'

describe('moduleSpecifierToSourcePath', () => {
  const projectRoot = path.resolve('/project')

  test('resolves sibling module', () => {
    expect(
      moduleSpecifierToSourcePath(
        './User.js',
        path.resolve(projectRoot, 'src/service/UserService.ts'),
        projectRoot,
      ),
    ).toBe('src/service/User.ts')
  })

  test('resolves parent module', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../model/User.js',
        path.resolve(projectRoot, 'src/service/UserService.ts'),
        projectRoot,
      ),
    ).toBe('src/model/User.ts')
  })

  test('resolves nested parent path', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../../shared/types/User.js',
        path.resolve(projectRoot, 'src/service/internal/UserService.ts'),
        projectRoot,
      ),
    ).toBe('src/shared/types/User.ts')
  })

  test('normalizes mjs extension', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../model/User.mjs',
        path.resolve(projectRoot, 'src/service/UserService.ts'),
        projectRoot,
      ),
    ).toBe('src/model/User.ts')
  })

  test('normalizes cjs extension', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../model/User.cjs',
        path.resolve(projectRoot, 'src/service/UserService.ts'),
        projectRoot,
      ),
    ).toBe('src/model/User.ts')
  })

  test('keeps ts extension unchanged', () => {
    expect(
      moduleSpecifierToSourcePath(
        '../model/User.ts',
        path.resolve(projectRoot, 'src/service/UserService.ts'),
        projectRoot,
      ),
    ).toBe('src/model/User.ts')
  })
})
