import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { FullPath, ProjectRelativePath } from '@gyomu/schema/typescript'
import { toProjectRelativePath } from '../toProjectRelativePath.js'
import { toAbsolutePath } from '../toAbsolutePath.js'

describe('toProjectRelativePath', () => {
  test('converts file path to project-relative path', () => {
    const projectRoot = FullPath(path.resolve('/project'))
    const filePath = FullPath(path.resolve(projectRoot, 'src/user/UserService.ts'))

    expect(toProjectRelativePath(filePath, projectRoot)).toBe('src/user/UserService.ts')
  })

  test('converts nested path', () => {
    const projectRoot = FullPath(path.resolve('/project'))
    const filePath = FullPath(path.resolve(projectRoot, 'packages/core/src/index.ts'))

    expect(toProjectRelativePath(filePath, projectRoot)).toBe('packages/core/src/index.ts')
  })

  test('returns empty string for project root itself', () => {
    const projectRoot = FullPath(path.resolve('/project'))

    expect(toProjectRelativePath(projectRoot, projectRoot)).toBe('')
  })

  test('normalizes path separators', () => {
    const result = toProjectRelativePath(
      FullPath('C:\\project\\src\\user\\User.ts'),
      FullPath('C:\\project'),
    )

    expect(result).toBe('src/user/User.ts')
  })

  test('round trips with toProjectAbsolutePath', () => {
    const projectRoot = FullPath(path.resolve('/project'))

    const relativePath = ProjectRelativePath('src/user/UserService.ts')

    const absolutePath = toAbsolutePath(relativePath, projectRoot)

    expect(toProjectRelativePath(absolutePath, projectRoot)).toBe(relativePath)
  })
})
