import { describe, expect, it, vi } from 'vitest'
import { Node, Project } from 'ts-morph'
import { analyzeArrayBindingPattern } from '../analyzeArrayBindingPattern.js'
import { analyzeBindingElement } from '../analyzeBindingElement.js'

vi.mock('../analyzeBindingElement.js', () => ({
  analyzeBindingElement: vi.fn(),
}))

describe('analyzeArrayBindingPattern', () => {
  const mockedAnalyzeBindingElement = vi.mocked(analyzeBindingElement)

  const getArrayBindingPattern = (elements: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `function test([${elements}]) {}`)

    const parameter = sourceFile.getFunctionOrThrow('test').getParameters()[0]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return parameter!.getNameNode()
  }

  it('analyzes binding elements', () => {
    const node = getArrayBindingPattern('first, second')
    if (Node.isIdentifier(node)) {
      throw new Error('Invalid Test')
    }
    const firstResult = {
      member: {
        kind: 'binding',
        pattern: 'identifier',
        name: 'first',
      },
      dependencies: [{ id: 'first-dependency' }],
      reservedNames: ['first'],
    }

    const secondResult = {
      member: {
        kind: 'binding',
        pattern: 'identifier',
        name: 'second',
      },
      dependencies: [{ id: 'second-dependency' }],
      reservedNames: ['second'],
    }

    mockedAnalyzeBindingElement
      .mockReturnValueOnce(firstResult as never)
      .mockReturnValueOnce(secondResult as never)

    const result = analyzeArrayBindingPattern({
      node,
    } as never)

    expect(mockedAnalyzeBindingElement).toHaveBeenCalledTimes(2)
    expect(mockedAnalyzeBindingElement).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining(node.getElements()[0]),
      0,
      expect.anything(),
    )
    expect(mockedAnalyzeBindingElement).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(node.getElements()[1]),
      1,
      expect.anything(),
    )

    expect(result).toEqual({
      member: {
        kind: 'binding',
        pattern: 'array',
        elements: [firstResult.member, secondResult.member],
      },
      dependencies: [{ id: 'first-dependency' }, { id: 'second-dependency' }],
      reservedNames: ['first', 'second'],
    })
  })

  it('omits OmittedExpression from elements', () => {
    const node = getArrayBindingPattern('first, , third')

    if (Node.isIdentifier(node)) {
      throw new Error('Invalid Test')
    }
    const firstResult = {
      member: {
        kind: 'binding',
        pattern: 'identifier',
        name: 'first',
      },
      dependencies: [],
      reservedNames: ['first'],
    }

    const thirdResult = {
      member: {
        kind: 'binding',
        pattern: 'identifier',
        name: 'third',
      },
      dependencies: [],
      reservedNames: ['third'],
    }

    mockedAnalyzeBindingElement
      .mockReturnValueOnce(firstResult as never)
      .mockReturnValueOnce(thirdResult as never)

    const result = analyzeArrayBindingPattern({
      node,
    } as never)

    expect(mockedAnalyzeBindingElement).toHaveBeenCalledTimes(2)

    expect(mockedAnalyzeBindingElement).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining(node.getElements()[0]),
      0,
      expect.anything(),
    )

    expect(mockedAnalyzeBindingElement).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(node.getElements()[2]),
      2,
      expect.anything(),
    )

    expect(result).toEqual({
      member: {
        kind: 'binding',
        pattern: 'array',
        elements: [firstResult.member, thirdResult.member],
      },
      dependencies: [],
      reservedNames: ['first', 'third'],
    })
  })

  it('flattens dependencies and reserved names', () => {
    const node = getArrayBindingPattern('first, second')

    mockedAnalyzeBindingElement
      .mockReturnValueOnce({
        member: { kind: 'binding', pattern: 'identifier', name: 'first' },
        dependencies: ['dependency-1', 'dependency-2'],
        reservedNames: ['first', 'firstAlias'],
      } as never)
      .mockReturnValueOnce({
        member: { kind: 'binding', pattern: 'identifier', name: 'second' },
        dependencies: ['dependency-3'],
        reservedNames: ['second'],
      } as never)

    const result = analyzeArrayBindingPattern({
      node,
    } as never)

    expect(result.dependencies).toEqual(['dependency-1', 'dependency-2', 'dependency-3'])

    expect(result.reservedNames).toEqual(['first', 'firstAlias', 'second'])
  })
})
