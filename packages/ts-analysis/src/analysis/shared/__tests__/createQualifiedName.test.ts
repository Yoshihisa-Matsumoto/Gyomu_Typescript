import { Project } from 'ts-morph'
import { describe, expect, test } from 'vitest'

import { createQualifiedName } from '../createQualifiedName.js'

describe('createQualifiedName', () => {
  const project = new Project({
    useInMemoryFileSystem: true,
  })

  const sourceFile = project.createSourceFile(
    'sample.ts',
    `
export class UserService {
  getUser() {
    return 'user'
  }

  static create() {
    return new UserService()
  }
}

export interface UserRepository {
  findById(id: string): string
}

export function createUser() {
  return {}
}
`,
  )

  test('creates qualified name for function', () => {
    const fn = sourceFile.getFunctionOrThrow('createUser')

    expect(createQualifiedName(fn)).toBe('createUser')
  })

  test('creates qualified name for class method', () => {
    const method = sourceFile.getClassOrThrow('UserService').getMethodOrThrow('getUser')

    expect(createQualifiedName(method)).toBe('UserService.getUser')
  })

  test('creates qualified name for static method', () => {
    const method = sourceFile.getClassOrThrow('UserService').getMethodOrThrow('create')

    expect(createQualifiedName(method)).toBe('UserService.create')
  })

  test('creates qualified name for interface member', () => {
    const method = sourceFile.getInterfaceOrThrow('UserRepository').getMethodOrThrow('findById')

    expect(createQualifiedName(method)).toBe('UserRepository.findById')
  })
})
