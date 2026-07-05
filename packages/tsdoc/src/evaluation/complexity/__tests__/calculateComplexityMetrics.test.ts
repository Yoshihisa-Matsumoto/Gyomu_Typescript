import { describe, expect, it } from 'vitest'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { calculateComplexityMetrics } from '../calculateComplexityMetrics.js'
import type { TypeAnalysis } from '@gyomu/schema/schemas/typescript/index'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import type { FileAnalysisResult } from '@gyomu/ts-analysis'

describe('calculateComplexityMetrics', () => {
  it('returns empty map when no exports exist', () => {
    const result = calculateComplexityMetrics({
      analysis: {
        exports: [],
      },
    } as any as FileAnalysisResult)

    expect(result.size).toBe(0)
  })
  it('counts optional properties and referenced types', () => {
    const symbolId = SymbolId('User')
    const symbolIdentity: SymbolIdentity = {
      signatureId: SignatureId('property'),
      symbolId,
    }
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
    } as FileAnalysisResult)

    expect(result.get(symbolId)).toMatchObject({
      parameterCount: 1,
      optionalCount: 1,
      referencedTypeCount: 1,
    })
  })

  it('counts union types', () => {
    const symbolId = SymbolId('Status')
    const symbolIdentity: SymbolIdentity = {
      signatureId: SignatureId('property'),
      symbolId,
    }
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
            members: [],
            type: {
              structure: {
                kind: 'union',
                types: [{}, {}, {}],
              },
            },
          },
        ],
      },
    } as any as FileAnalysisResult)

    expect(result.get(symbolId)).toMatchObject({
      unionCount: 3,
    })
  })

  it('counts nested referenced types recursively', () => {
    const symbolId = SymbolId('User')
    const symbolIdentity: SymbolIdentity = {
      signatureId: SignatureId('property'),
      symbolId,
    }
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
                optional: false,
                type: {
                  structure: {
                    kind: 'object',
                    members: [
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
          },
        ],
      },
    } as any as FileAnalysisResult)

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })
})
