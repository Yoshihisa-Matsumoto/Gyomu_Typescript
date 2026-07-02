import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { toProjectRelativePath } from '../toProjectRelativePath.js'
import { toProjectAbsolutePath } from '../toProjectAbsolutePath.js'

describe('toProjectRelativePath', () => {
  test('converts file path to project-relative path', () => {
    const projectRoot = path.resolve('/project')
    const filePath = path.resolve(projectRoot, 'src/user/UserService.ts')

    expect(toProjectRelativePath(filePath, projectRoot)).toBe('src/user/UserService.ts')
  })

  test('converts nested path', () => {
    const projectRoot = path.resolve('/project')
    const filePath = path.resolve(projectRoot, 'packages/core/src/index.ts')

    expect(toProjectRelativePath(filePath, projectRoot)).toBe('packages/core/src/index.ts')
  })

  test('returns empty string for project root itself', () => {
    const projectRoot = path.resolve('/project')

    expect(toProjectRelativePath(projectRoot, projectRoot)).toBe('')
  })

  test('normalizes path separators', () => {
    const result = toProjectRelativePath('C:\\project\\src\\user\\User.ts', 'C:\\project')

    expect(result).toBe('src/user/User.ts')
  })

  test('round trips with toProjectAbsolutePath', () => {
    const projectRoot = path.resolve('/project')

    const relativePath = 'src/user/UserService.ts'

    const absolutePath = toProjectAbsolutePath(relativePath, projectRoot)

    expect(toProjectRelativePath(absolutePath, projectRoot)).toBe(relativePath)
  })
})
