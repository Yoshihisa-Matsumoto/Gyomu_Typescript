import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { FullPath } from '@gyomu/schema'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { sourcePathToModuleSpecifier } from '../sourcePathToModuleSpecifier.js'

describe('sourcePathToModuleSpecifier', () => {
  const projectRoot = FullPath(path.resolve('/project'))

  test('creates sibling module specifier', () => {
    expect(
      sourcePathToModuleSpecifier(
        ProjectRelativePath('src/service/User.ts'),
        path.resolve(projectRoot, 'src/service/UserService.ts'),
        projectRoot,
      ),
    ).toBe('./User.js')
  })

  test('creates parent module specifier', () => {
    expect(
      sourcePathToModuleSpecifier(
        ProjectRelativePath('src/model/User.ts'),
        path.resolve(projectRoot, 'src/service/UserService.ts'),
        projectRoot,
      ),
    ).toBe('../model/User.js')
  })

  test('creates nested parent module specifier', () => {
    expect(
      sourcePathToModuleSpecifier(
        ProjectRelativePath('src/shared/types/User.ts'),
        path.resolve(projectRoot, 'src/service/internal/UserService.ts'),
        projectRoot,
      ),
    ).toBe('../../shared/types/User.js')
  })

  test('converts ts extension to js', () => {
    expect(
      sourcePathToModuleSpecifier(
        ProjectRelativePath('src/model/User.ts'),
        path.resolve(projectRoot, 'src/service/UserService.ts'),
        projectRoot,
      ),
    ).toMatch(/\.js$/)
  })

  test('converts tsx extension to js', () => {
    expect(
      sourcePathToModuleSpecifier(
        ProjectRelativePath('src/components/App.tsx'),
        path.resolve(projectRoot, 'src/pages/Home.tsx'),
        projectRoot,
      ),
    ).toBe('../components/App.js')
  })

  test('adds ./ prefix for sibling files', () => {
    const result = sourcePathToModuleSpecifier(
      ProjectRelativePath('src/service/User.ts'),
      path.resolve(projectRoot, 'src/service/UserService.ts'),
      projectRoot,
    )

    expect(result.startsWith('./')).toBe(true)
  })
})
