import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { toProjectRelativePath } from '@gyomu/ts-analysis'
import { FullPath, ProjectRelativePath } from '@gyomu/schema/typescript'
import { mapSourcePathToOutputPath } from '../mapSourcePathToOutputPath.js'

describe('mapSourcePathToOutputPath', () => {
  const cwd = FullPath(path.resolve('test-project'))

  test('maps source file to output file', () => {
    const result = mapSourcePathToOutputPath('src/config/index.ts', {
      rootDir: 'src',
      outDir: 'dist',
      cwd,
    })

    expect(toProjectRelativePath(ProjectRelativePath(result), cwd)).toBe('dist/config/index.js')
  })

  test('preserves nested directory structure', () => {
    const result = mapSourcePathToOutputPath('src/domain/user/UserService.ts', {
      rootDir: 'src',
      outDir: 'dist',
      cwd,
    })

    expect(toProjectRelativePath(ProjectRelativePath(result), cwd)).toBe(
      'dist/domain/user/UserService.js',
    )
  })

  test('converts tsx extension to js', () => {
    const result = mapSourcePathToOutputPath('src/components/App.tsx', {
      rootDir: 'src',
      outDir: 'dist',
      cwd,
    })

    expect(toProjectRelativePath(ProjectRelativePath(result), cwd)).toBe('dist/components/App.js')
  })

  test('throws when source file is outside rootDir', () => {
    expect(() =>
      mapSourcePathToOutputPath('../shared/index.ts', {
        rootDir: 'src',
        outDir: 'dist',
        cwd,
      }),
    ).toThrow('not inside rootDir')
  })

  test('accepts absolute source path', () => {
    const result = mapSourcePathToOutputPath(path.join(cwd, 'src', 'config', 'index.ts'), {
      rootDir: 'src',
      outDir: 'dist',
      cwd,
    })

    expect(toProjectRelativePath(ProjectRelativePath(result), cwd)).toBe('dist/config/index.js')
  })
})
