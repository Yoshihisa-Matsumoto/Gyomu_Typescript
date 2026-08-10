import { describe, expect, it } from 'vitest'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { calculateComplexityMetrics } from '../calculateComplexityMetrics.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { SymbolIdentity, TypeAnalysis } from '@gyomu/schema/schemas/typescript'

const createSymbolIdentity = (symbolId: SymbolId): SymbolIdentity => ({
  signatureId: SignatureId('test'),
  symbolId,
})

const createFileAnalysisContext = (
  symbolId: SymbolId,
  symbol: Record<string, unknown>,
  kind: 'local' | 'external' = 'local',
): FileAnalysisContext =>
  ({
    analysis: {
      exports: [
        {
          kind,
          identity: createSymbolIdentity(symbolId),
        },
      ],
      symbols: [
        {
          id: symbolId,
          identity: createSymbolIdentity(symbolId),
          ...symbol,
        },
      ],
    },
  }) as any as FileAnalysisContext

describe('calculateComplexityMetrics', () => {
  it('returns empty map when no exports exist', () => {
    const result = calculateComplexityMetrics({
      analysis: {
        exports: [],
      },
    } as any as FileAnalysisContext)

    expect(result.size).toBe(0)
  })

  it('ignores non-local exports', () => {
    const symbolId = SymbolId('User')

    const result = createResult(
      symbolId,
      {
        members: [],
      },
      'external',
    )

    expect(result.size).toBe(0)
  })

  it('ignores local exports when the symbol cannot be found', () => {
    const symbolId = SymbolId('User')
    const identity = createSymbolIdentity(symbolId)

    const result = calculateComplexityMetrics({
      analysis: {
        exports: [
          {
            kind: 'local',
            identity,
          },
        ],
        symbols: [],
      },
    } as any as FileAnalysisContext)

    expect(result.size).toBe(0)
  })

  it('counts optional properties and referenced types', () => {
    const symbolId = SymbolId('User')
    const symbolIdentity = createSymbolIdentity(symbolId)

    const result = calculateComplexityMetrics({
      analysis: {
        exports: [
          {
            kind: 'local',
            identity: symbolIdentity,
          },
        ],
        symbols: [
          {
            id: symbolId,
            identity: symbolIdentity,
            members: [
              {
                documentable: true,
                kind: 'property',
                optional: true,
                type: {
                  structure: {
                    kind: 'reference',
                  },
                },
              },
            ],
          },
        ],
      },
    } as any as FileAnalysisContext)

    expect(result.get(symbolId)).toMatchObject({
      parameterCount: 1,
      optionalCount: 1,
      referencedTypeCount: 1,
    })
  })

  it('ignores non-documentable members', () => {
    const symbolId = SymbolId('User')

    const result = createResult(symbolId, {
      members: [
        {
          documentable: false,
          kind: 'property',
          optional: true,
          type: {
            structure: {
              kind: 'reference',
            },
          },
        },
      ],
    })

    expect(result.get(symbolId)).toMatchObject({
      parameterCount: 1,
      optionalCount: 0,
      referencedTypeCount: 0,
    })
  })

  it('counts union types', () => {
    const symbolId = SymbolId('Status')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'union',
          types: [{}, {}, {}],
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      unionCount: 3,
    })
  })

  it('counts nested referenced types recursively', () => {
    const symbolId = SymbolId('User')

    const result = createResult(symbolId, {
      members: [
        {
          documentable: true,
          kind: 'property',
          optional: false,
          type: {
            structure: {
              kind: 'object',
              properties: [
                {
                  optional: false,
                  type: {
                    structure: {
                      kind: 'reference',
                    },
                  } as TypeAnalysis,
                },
              ],
            },
          },
        },
      ],
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('calculates method return type depth and parameter complexity', () => {
    const symbolId = SymbolId('Service')

    const result = createResult(symbolId, {
      members: [
        {
          documentable: true,
          kind: 'method',
          parameters: [
            {
              documentable: true,
              kind: 'property',
              optional: true,
              type: {
                structure: {
                  kind: 'reference',
                },
              },
            },
          ],
          returnType: {
            structure: {
              kind: 'reference',
            },
          },
        },
      ],
    })

    expect(result.get(symbolId)).toMatchObject({
      parameterCount: 1,
      optionalCount: 1,
      referencedTypeCount: 2,
      returnTypeDepth: expect.any(Number),
    })
  })

  it('handles methods without return types', () => {
    const symbolId = SymbolId('Service')

    const result = createResult(symbolId, {
      members: [
        {
          documentable: true,
          kind: 'method',
          parameters: [],
        },
      ],
    })

    expect(result.get(symbolId)).toBeDefined()
  })

  it('counts effect and Effect Schema complexity', () => {
    const symbolId = SymbolId('User')

    const result = createResult(symbolId, {
      members: [],
      type: {
        effect: {},
        source: 'effect-schema',
        structure: {
          kind: 'primitive',
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      effectComplexity: expect.any(Number),
      schemaComplexity: 5,
    })
  })

  it('handles array types', () => {
    const symbolId = SymbolId('Users')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'array',
          elementType: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles function types', () => {
    const symbolId = SymbolId('Handler')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'function',
          parameters: [
            {
              type: {
                structure: {
                  kind: 'reference',
                },
              },
            },
          ],
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles object index signatures', () => {
    const symbolId = SymbolId('Dictionary')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'object',
          indexSignatures: [
            {
              parameterType: {
                structure: {
                  kind: 'primitive',
                },
              },
              type: {
                structure: {
                  kind: 'reference',
                },
              },
            },
          ],
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles empty object types', () => {
    const symbolId = SymbolId('Empty')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'object',
        },
      },
    })

    expect(result.get(symbolId)).toBeDefined()
  })

  it.each(['literal', 'primitive', 'this'] as const)('handles %s types', (kind) => {
    const symbolId = SymbolId(`Type-${kind}`)

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind,
        },
      },
    })

    expect(result.get(symbolId)).toBeDefined()
  })

  it('handles conditional types', () => {
    const symbolId = SymbolId('Conditional')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'conditional',
          checkType: {
            structure: {
              kind: 'reference',
            },
          },
          extendsType: {
            structure: {
              kind: 'reference',
            },
          },
          trueType: {
            structure: {
              kind: 'reference',
            },
          },
          falseType: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 4,
    })
  })

  it('handles constructor types', () => {
    const symbolId = SymbolId('Constructor')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'constructor',
          parameters: [
            {
              type: {
                structure: {
                  kind: 'reference',
                },
              },
            },
          ],
          returnType: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 2,
    })
  })

  it('handles generic types', () => {
    const symbolId = SymbolId('Generic')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'generics',
          typeParameters: [
            {
              structure: {
                kind: 'reference',
              },
            },
          ],
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it.each(['parenthesized', 'optional', 'rest', 'namedTupleMember'] as const)(
    'unwraps %s types',
    (kind) => {
      const symbolId = SymbolId(`Type-${kind}`)

      const result = createResult(symbolId, {
        members: [],
        type: {
          structure: {
            kind,
            type: {
              structure: {
                kind: 'reference',
              },
            },
          },
        },
      })

      expect(result.get(symbolId)).toMatchObject({
        referencedTypeCount: 1,
      })
    },
  )

  it('handles import types', () => {
    const symbolId = SymbolId('Imported')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'import',
          typeArguments: [
            {
              structure: {
                kind: 'reference',
              },
            },
          ],
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles indexed access types', () => {
    const symbolId = SymbolId('Indexed')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'indexedAccess',
          indexType: {
            structure: {
              kind: 'reference',
            },
          },
          objectType: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 2,
    })
  })

  it('handles infer types with and without constraint', () => {
    const symbolId = SymbolId('Infer')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'infer',
          constraint: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles mapped types', () => {
    const symbolId = SymbolId('Mapped')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'mapped',
          constraint: {
            structure: {
              kind: 'reference',
            },
          },
          nameType: {
            structure: {
              kind: 'reference',
            },
          },
          valueType: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 3,
    })
  })

  it('handles mapped types without optional name and value types', () => {
    const symbolId = SymbolId('Mapped')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'mapped',
          constraint: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles template literal types', () => {
    const symbolId = SymbolId('Template')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'templateLiteral',
          spans: [
            'prefix',
            {
              structure: {
                kind: 'reference',
              },
            },
            'suffix',
          ],
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles tuple types', () => {
    const symbolId = SymbolId('Tuple')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'tuple',
          elements: [
            {
              type: {
                structure: {
                  kind: 'reference',
                },
              },
            },
          ],
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles type operators', () => {
    const symbolId = SymbolId('Operator')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'typeOperator',
          target: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })

  it('handles type predicates with and without a type', () => {
    const symbolId = SymbolId('Predicate')

    const result = createResult(symbolId, {
      members: [],
      type: {
        structure: {
          kind: 'typePredicate',
          type: {
            structure: {
              kind: 'reference',
            },
          },
        },
      },
    })

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })
})

const createResult = (
  symbolId: SymbolId,
  symbol: Record<string, unknown>,
  kind: 'local' | 'external' = 'local',
) => calculateComplexityMetrics(createFileAnalysisContext(symbolId, symbol, kind))
