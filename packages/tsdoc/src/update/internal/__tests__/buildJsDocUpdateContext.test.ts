/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectRelativePath, SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { buildJsDocUpdateContext } from '../buildJsDocUpdateContext.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { ComplexityMetrics } from '../../../evaluation/complexity/ComplexityMetrics.js'
import type {
  DependencyCandidate,
  SymbolAnalysis,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'
// import type { FileAnalysisResult } from '../../../analysis/file/FileAnalysisResult.js'

const {
  mockBuildContextEntry,
  mockBuildExistingJsDoc,
  mockBuildSchemaStructureNode,
  mockComputeComplexityScore,
  mockModeResolver,
} = vi.hoisted(() => ({
  mockBuildContextEntry: vi.fn(),
  mockBuildExistingJsDoc: vi.fn(),
  mockBuildSchemaStructureNode: vi.fn(),
  mockComputeComplexityScore: vi.fn(),
  mockModeResolver: vi.fn(),
}))

vi.mock('../buildContextEntry.js', () => ({
  buildContextEntry: mockBuildContextEntry,
}))

vi.mock('../buildExistingJsDoc.js', () => ({
  buildExistingJsDoc: mockBuildExistingJsDoc,
}))

vi.mock('../buildSchemaStructureNode.js', () => ({
  buildSchemaStructureNode: mockBuildSchemaStructureNode,
}))

vi.mock('../../../evaluation/complexity/computeComplexityScore.js', () => ({
  computeComplexityScore: mockComputeComplexityScore,
}))

vi.mock('@gyomu/ai-compiler/jsdoc-update', async () => {
  const actual = await vi.importActual<
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    typeof import('@gyomu/ai-compiler/jsdoc-update')
  >('@gyomu/ai-compiler/jsdoc-update')

  return {
    ...actual,
    defaultComplexityStrategy: {},
    modeResolver: mockModeResolver,
  }
})

describe('buildJsDocUpdateContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockBuildContextEntry.mockImplementation((_fileResult, member) => ({
      target: member.identity,
      kind: member.kind,
      name: member.name,
    }))

    mockBuildExistingJsDoc.mockReturnValue(undefined)

    mockBuildSchemaStructureNode.mockReturnValue({
      name: 'User',
      kind: 'object',
      children: [],
    })

    mockComputeComplexityScore.mockReturnValue(0.5)

    mockModeResolver.mockReturnValue('light')
  })

  const createIdentity = (name: string): SymbolIdentity => ({
    symbolId: SymbolId(name),
    signatureId: SignatureId(`signature:${name}`),
  })

  const createComplexity = (): ComplexityMetrics =>
    ({
      parameterCount: 0,
      optionalCount: 0,
      referencedTypeCount: 0,
      unionCount: 0,
      nestingDepth: 0,
      returnTypeDepth: 0,
      schemaComplexity: 0,
      effectComplexity: 0,
    }) as any

  const createFileResult = (
    overrides: Partial<FileAnalysisContext['analysis']> = {},
  ): FileAnalysisContext =>
    ({
      analysis: {
        path: ProjectRelativePath('/test/example.ts'),
        exports: [],
        symbols: [],
        ...overrides,
      },
      metadata: {
        parsedJsDocs: new Map(),
      },
    }) as any

  const createSymbol = (name: string, overrides: Record<string, unknown> = {}) => {
    const identity = createIdentity(name)

    return {
      id: SymbolId(name),
      identity,
      kind: 'function',
      snippet: `function ${name}() {}`,
      members: [],
      signature: {
        isOverloadImplementation: false,
      },
      dependencyCandidates: [],
      ...overrides,
    } as unknown as SymbolAnalysis
  }

  const run = (fileResult: FileAnalysisContext, metrics = new Map<SymbolId, ComplexityMetrics>()) =>
    buildJsDocUpdateContext('test-project', fileResult, metrics)

  it('builds the basic file and symbol context', () => {
    const symbol = createSymbol('User')

    const fileResult = createFileResult({
      path: ProjectRelativePath('/test/example.ts'),
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as any)

    const metrics = new Map([[symbol.id, createComplexity()]])

    const result = run(fileResult, metrics)

    expect(result).toMatchObject({
      project: {
        name: 'test-project',
      },
      source: {
        relativePath: '/test/example.ts',
      },
      symbols: [
        {
          target: symbol.identity,
          symbol: {
            name: 'User',
            kind: 'function',
          },
          code: {
            snippet: 'function User() {}',
          },
          children: [],
          relatedSymbols: [],
        },
      ],
    })

    expect(mockComputeComplexityScore).toHaveBeenCalledWith(metrics.get(symbol.id))

    expect(mockModeResolver).toHaveBeenCalledTimes(1)
  })

  it('ignores non-local exports', () => {
    const symbol = createSymbol('User')

    const fileResult = createFileResult({
      exports: [
        {
          kind: 're-export',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as any)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols).toHaveLength(0)
  })

  it('throws UpdateError when exported symbol cannot be found', () => {
    const identity = createIdentity('Missing')

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity,
        },
      ],
      symbols: [],
    } as any)

    expect(() => run(fileResult, new Map())).toThrowError(
      expect.objectContaining({
        message: 'Symbol Not Found',
        phase: 'context-build',
        filePath: '/test/example.ts',
      }),
    )
  })

  it('skips overload implementation symbols', () => {
    const symbol = createSymbol('User', {
      signature: {
        isOverloadImplementation: true,
      },
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as any)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols).toHaveLength(0)
  })

  it('throws UpdateError when complexity metrics are missing', () => {
    const symbol = createSymbol('User')

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as any)

    expect(() => run(fileResult, new Map())).toThrowError(
      expect.objectContaining({
        message: 'Complexity metrix not found',
        phase: 'context-build',
        symbolId: symbol.id,
      }),
    )
  })

  it('builds children from symbol members', () => {
    const member = {
      id: SymbolId('name'),
      identity: createIdentity('name'),
      kind: 'property',
      name: 'name',
      documentable: true,
      location: {
        startLine: 2,
      },
    }

    const symbol = createSymbol('User', {
      members: [member],
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(mockBuildContextEntry).toHaveBeenCalledWith(fileResult, member, symbol)

    expect(result.symbols[0]?.children).toHaveLength(1)
  })

  it('uses effect from symbol type', () => {
    const symbol = createSymbol('User', {
      type: {
        effect: {
          success: 'User',
          error: 'Error',
          requirements: ['Requirement'],
        },
      },
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols[0]?.effectSignals).toEqual({
      success: 'User',
      error: 'Error',
      requirements: ['Requirement'],
    })
  })

  it('uses effect from signature return type when symbol type has no effect', () => {
    const symbol = createSymbol('User', {
      signature: {
        isOverloadImplementation: false,
        returnType: {
          effect: {
            success: 'User',
            error: 'Error',
            requirements: ['Requirement'],
          },
        },
      },
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols[0]?.effectSignals).toEqual({
      success: 'User',
      error: 'Error',
      requirements: ['Requirement'],
    })
  })

  it('prefers symbol type effect over signature return type effect', () => {
    const symbol = createSymbol('User', {
      type: {
        effect: {
          success: 'TypeSuccess',
          error: 'TypeError',
          requirements: ['TypeRequirement'],
        },
      },
      signature: {
        isOverloadImplementation: false,
        returnType: {
          effect: {
            success: 'ReturnSuccess',
            error: 'ReturnError',
            requirements: ['ReturnRequirement'],
          },
        },
      },
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols[0]?.effectSignals).toEqual({
      success: 'TypeSuccess',
      error: 'TypeError',
      requirements: ['TypeRequirement'],
    })
  })

  it('includes dependencies with all supported reasons', () => {
    const reasons = [
      ['$return'],
      ['$extend'],
      ['$implement'],
      ['$generics'],
      ['$member'],
      ['$parameters'],
      ['$body'],
    ] as const

    const candidates: Array<DependencyCandidate> = reasons.map(
      (memberPath, index) =>
        ({
          target: createIdentity(`Dependency${index}`),
          source: {
            memberPath,
          },
        }) as unknown as DependencyCandidate,
    )

    const symbol = createSymbol('User', {
      dependencyCandidates: candidates,
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols[0]?.dependencies).toEqual({
      candidates: [
        {
          reason: 'return',
          target: candidates[0]!.target,
        },
        {
          reason: 'extends',
          target: candidates[1]!.target,
        },
        {
          reason: 'implements',
          target: candidates[2]!.target,
        },
        {
          reason: 'generics',
          target: candidates[3]!.target,
        },
        {
          reason: 'member',
          target: candidates[4]!.target,
        },
        {
          reason: 'parameter',
          target: candidates[5]!.target,
        },
        {
          reason: 'body',
          target: candidates[6]!.target,
        },
      ],
    })
  })

  it('removes duplicate dependency summaries', () => {
    const target = {
      scope: 'local-file',
      localSymbolName: 'Dependency',
    } as const

    const symbol = createSymbol('User', {
      dependencyCandidates: [
        {
          target,
          source: {
            memberPath: ['$return'],
          },
        },
        {
          target,
          source: {
            memberPath: ['$return'],
          },
        },
      ],
    })
    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    console.dir(result.symbols[0]?.dependencies, { depth: null })

    expect(result.symbols[0]?.dependencies?.candidates).toHaveLength(1)
  })

  it('ignores dependencies without a recognized reason', () => {
    const symbol = createSymbol('User', {
      dependencyCandidates: [
        {
          target: createIdentity('Dependency'),
          source: {
            memberPath: ['$unknown'],
          },
        },
        {
          target: createIdentity('EmptyPath'),
          source: {
            memberPath: [],
          },
        },
      ],
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols[0]?.dependencies).toBeUndefined()
  })

  it('uses the first path segment when symbol name is not present', () => {
    const target = createIdentity('Dependency')

    const symbol = createSymbol('User', {
      dependencyCandidates: [
        {
          target,
          source: {
            memberPath: ['$member'],
          },
        },
      ],
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols[0]?.dependencies).toEqual({
      candidates: [
        {
          reason: 'member',
          target,
        },
      ],
    })
  })

  it('includes schema analysis for effect-schema deep mode', () => {
    mockModeResolver.mockReturnValue('deep')

    const symbol = createSymbol('User', {
      type: {
        source: 'effect-schema',
        structure: {
          kind: 'object',
        },
      },
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(mockBuildSchemaStructureNode).toHaveBeenCalledWith(symbol.type?.structure, 'User')

    expect(result.symbols[0]?.analysis).toEqual({
      schemaStructure: {
        name: 'User',
        kind: 'object',
        children: [],
      },
      paramSemantics: [],
      sideEffects: [],
    })
  })

  it('does not include schema analysis for light mode', () => {
    mockModeResolver.mockReturnValue('light')

    const symbol = createSymbol('User', {
      type: {
        source: 'effect-schema',
        structure: {
          kind: 'object',
        },
      },
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols[0]?.analysis).toBeUndefined()
    expect(mockBuildSchemaStructureNode).not.toHaveBeenCalled()
  })

  it('does not include dependencies when all candidates are filtered', () => {
    const symbol = createSymbol('User', {
      dependencyCandidates: [
        {
          target: createIdentity('Dependency'),
          source: {
            memberPath: ['$unknown'],
          },
        },
      ],
    })

    const fileResult = createFileResult({
      exports: [
        {
          kind: 'local',
          identity: symbol.identity,
        },
      ],
      symbols: [symbol],
    } as unknown as Partial<FileAnalysisContext['analysis']>)

    const result = run(fileResult, new Map([[symbol.id, createComplexity()]]))

    expect(result.symbols[0]?.dependencies).toBeUndefined()
  })
})
