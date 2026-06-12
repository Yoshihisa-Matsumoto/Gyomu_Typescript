import { describe, expect, it } from 'vitest'
import { calculateComplexityMetrics } from '../calculateComplexityMetrics.js'
import type { FileAnalysisResult } from '../../../analysis/file/FileAnalysisResult.js'

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
    const symbolId = 'User'

    const result = calculateComplexityMetrics({
      analysis: {
        exports: [
          {
            symbol: {
              id: symbolId,
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
    const symbolId = 'Status'

    const result = calculateComplexityMetrics({
      analysis: {
        exports: [
          {
            symbol: {
              id: symbolId,
              members: [],
              type: {
                structure: {
                  kind: 'union',
                  types: [{}, {}, {}],
                },
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
    const symbolId = 'User'

    const result = calculateComplexityMetrics({
      analysis: {
        exports: [
          {
            symbol: {
              id: symbolId,
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
                          documentable: true,
                          kind: 'property',
                          optional: false,
                          type: {
                            structure: {
                              kind: 'reference',
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    } as FileAnalysisResult)

    expect(result.get(symbolId)).toMatchObject({
      referencedTypeCount: 1,
    })
  })
})
