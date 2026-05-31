import { Project } from 'ts-morph'
import { describe, expect, test } from 'vitest'

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

    const result = createSymbolIdentity(method, 'src/service/UserService.ts')

    expect(result.qualifiedName).toBe('UserService.getUser')

    expect(result.id).toBe('src/service/UserService.ts::UserService.getUser')
  })

  test('creates stable identity', () => {
    const method = sourceFile.getClassOrThrow('UserService').getMethodOrThrow('getUser')

    const first = createSymbolIdentity(method, 'src/service/UserService.ts')

    const second = createSymbolIdentity(method, 'src/service/UserService.ts')

    expect(first).toEqual(second)
  })

  test('different source paths produce different ids', () => {
    const method = sourceFile.getClassOrThrow('UserService').getMethodOrThrow('getUser')

    const first = createSymbolIdentity(method, 'src/a/UserService.ts')

    const second = createSymbolIdentity(method, 'src/b/UserService.ts')

    expect(first.id).not.toBe(second.id)
  })
})
