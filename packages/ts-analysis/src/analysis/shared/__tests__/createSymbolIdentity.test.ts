import { Project } from 'ts-morph'
import { describe, expect, test } from 'vitest'

import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { createSymbolIdentity } from '../createSymbolIdentity.js'

describe('createSymbolIdentity', () => {
  const project = new Project({
    useInMemoryFileSystem: true,
  })

  const sourceFile = project.createSourceFile(
    'sample.ts',
    `
export class UserService {
  getUser() {}
}
`,
  )

  test('creates symbol identity', () => {
    const method = sourceFile.getClassOrThrow('UserService').getMethodOrThrow('getUser')

    const result = createSymbolIdentity(
      method,
      ProjectRelativePath('src/service/UserService.ts'),
      'abc',
    )

    expect(result.qualifiedName).toBe('UserService.getUser')

    expect(result.id).toBe('src/service/UserService.ts::UserService.getUser::abc')
  })

  test('creates stable identity', () => {
    const method = sourceFile.getClassOrThrow('UserService').getMethodOrThrow('getUser')

    const first = createSymbolIdentity(
      method,
      ProjectRelativePath('src/service/UserService.ts'),
      'abc',
    )

    const second = createSymbolIdentity(
      method,
      ProjectRelativePath('src/service/UserService.ts'),
      'abc',
    )

    expect(first).toEqual(second)
  })

  test('different source paths produce different ids', () => {
    const method = sourceFile.getClassOrThrow('UserService').getMethodOrThrow('getUser')

    const first = createSymbolIdentity(method, ProjectRelativePath('src/a/UserService.ts'), 'abc')

    const second = createSymbolIdentity(method, ProjectRelativePath('src/b/UserService.ts'), 'abc')

    expect(first.id).not.toBe(second.id)
  })
})
