import { describe, expect, it, vi } from 'vitest'
import { Project } from 'ts-morph'
import { analyzeObjectBindingPattern } from '../analyzeObjectBindingPattern.js'
import type { ObjectBindingPattern } from 'ts-morph'
import type { ChildAnalysisArg } from '../../../types.js'

const { mockedAnalyzeBindingElement } = vi.hoisted(() => ({
  mockedAnalyzeBindingElement: vi.fn(),
}))

vi.mock('../analyzeBindingElement.js', () => ({
  analyzeBindingElement: mockedAnalyzeBindingElement,
}))

describe('analyzeObjectBindingPattern', () => {
  const getObjectBindingPattern = (elements: string): ObjectBindingPattern => {
    const project = new Project({
      useInMemoryFileSystem: true,
    })

    const sourceFile = project.createSourceFile('test.ts', `function test({ ${elements} }) {}`)

    return sourceFile
      .getFunctionOrThrow('test')
      .getParameters()[0]
      ?.getNameNode() as ObjectBindingPattern
  }

  it('analyzes all binding elements', () => {
    const node = getObjectBindingPattern('first, second')

    const firstResult = {
      member: {
        kind: 'binding',
        name: 'first',
      },
      dependencies: ['dependency-1'],
      reservedNames: ['first'],
    }

    const secondResult = {
      member: {
        kind: 'binding',
        name: 'second',
      },
      dependencies: ['dependency-2'],
      reservedNames: ['second'],
    }

    mockedAnalyzeBindingElement.mockReturnValueOnce(firstResult).mockReturnValueOnce(secondResult)

    const args = {
      node,
    } as ChildAnalysisArg<ObjectBindingPattern>

    const result = analyzeObjectBindingPattern(args)

    expect(mockedAnalyzeBindingElement).toHaveBeenCalledTimes(2)

    expect(mockedAnalyzeBindingElement).toHaveBeenNthCalledWith(1, node.getElements()[0], 0, args)

    expect(mockedAnalyzeBindingElement).toHaveBeenNthCalledWith(2, node.getElements()[1], 1, args)

    expect(result).toEqual({
      member: {
        kind: 'binding',
        pattern: 'object',
        elements: [firstResult.member, secondResult.member],
      },
      dependencies: ['dependency-1', 'dependency-2'],
      reservedNames: ['first', 'second'],
    })
  })

  it('flattens dependencies and reserved names', () => {
    const node = getObjectBindingPattern('first, second')

    mockedAnalyzeBindingElement
      .mockReturnValueOnce({
        member: {
          kind: 'binding',
          name: 'first',
        },
        dependencies: ['dependency-1', 'dependency-2'],
        reservedNames: ['first', 'firstAlias'],
      })
      .mockReturnValueOnce({
        member: {
          kind: 'binding',
          name: 'second',
        },
        dependencies: ['dependency-3'],
        reservedNames: ['second'],
      })

    const args = {
      node,
    } as ChildAnalysisArg<ObjectBindingPattern>

    const result = analyzeObjectBindingPattern(args)

    expect(result.dependencies).toEqual(['dependency-1', 'dependency-2', 'dependency-3'])

    expect(result.reservedNames).toEqual(['first', 'firstAlias', 'second'])
  })
})
