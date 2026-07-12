import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { FullPath } from '@gyomu/schema'
import { toAbsolutePath } from '../toAbsolutePath.js'

describe('toProjectAbsolutePath', () => {
  test('resolves project-relative path', () => {
    const result = toAbsolutePath(
      ProjectRelativePath('src/user/UserService.ts'),
      FullPath('/project'),
    )

    expect(result).toBe(path.resolve('/project', 'src/user/UserService.ts'))
  })

  test('resolves nested path', () => {
    const result = toAbsolutePath(
      ProjectRelativePath('packages/core/src/index.ts'),
      FullPath('/project'),
    )

    expect(result).toBe(path.resolve('/project', 'packages/core/src/index.ts'))
  })

  test('returns project root when relative path is empty', () => {
    const result = toAbsolutePath(ProjectRelativePath(''), FullPath('/project'))

    expect(result).toBe(path.resolve('/project'))
  })

  test('normalizes parent directory segments', () => {
    const result = toAbsolutePath(ProjectRelativePath('src/../package.json'), FullPath('/project'))

    expect(result).toBe(path.resolve('/project', 'src/../package.json'))
  })
})
