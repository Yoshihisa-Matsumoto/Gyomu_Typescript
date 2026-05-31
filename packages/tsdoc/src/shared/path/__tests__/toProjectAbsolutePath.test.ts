import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { toProjectAbsolutePath } from '../toProjectAbsolutePath.js'

describe('toProjectAbsolutePath', () => {
  test('resolves project-relative path', () => {
    const result = toProjectAbsolutePath('src/user/UserService.ts', '/project')

    expect(result).toBe(path.resolve('/project', 'src/user/UserService.ts'))
  })

  test('resolves nested path', () => {
    const result = toProjectAbsolutePath('packages/core/src/index.ts', '/project')

    expect(result).toBe(path.resolve('/project', 'packages/core/src/index.ts'))
  })

  test('returns project root when relative path is empty', () => {
    const result = toProjectAbsolutePath('', '/project')

    expect(result).toBe(path.resolve('/project'))
  })

  test('normalizes parent directory segments', () => {
    const result = toProjectAbsolutePath('src/../package.json', '/project')

    expect(result).toBe(path.resolve('/project', 'src/../package.json'))
  })
})
