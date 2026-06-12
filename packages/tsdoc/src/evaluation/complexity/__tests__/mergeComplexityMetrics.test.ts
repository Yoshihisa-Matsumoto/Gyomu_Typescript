import { describe, expect, it } from 'vitest'

import { mergeComplexityMetrics } from '../mergeComplexityMetrics.js'
import type { ComplexityMetrics } from '../ComplexityMetrics.js'

describe('mergeComplexityMetrics', () => {
  it('returns empty metrics when input is empty', () => {
    expect(mergeComplexityMetrics([])).toEqual({
      nestingDepth: 0,

      parameterCount: 0,
      optionalCount: 0,

      unionCount: 0,
      referencedTypeCount: 0,

      genericDepth: 0,
      returnTypeDepth: 0,
    })
  })

  it('returns the same values for a single metrics entry', () => {
    const metrics: ComplexityMetrics = {
      nestingDepth: 2,

      parameterCount: 3,
      optionalCount: 1,

      unionCount: 2,
      referencedTypeCount: 4,

      genericDepth: 1,
      returnTypeDepth: 2,
    }

    expect(mergeComplexityMetrics([metrics])).toEqual(metrics)
  })

  it('sums count-based metrics and takes max depth-based metrics', () => {
    const metrics1: ComplexityMetrics = {
      nestingDepth: 2,

      parameterCount: 1,
      optionalCount: 2,

      unionCount: 3,
      referencedTypeCount: 4,

      genericDepth: 1,
      returnTypeDepth: 2,
    }

    const metrics2: ComplexityMetrics = {
      nestingDepth: 5,

      parameterCount: 6,
      optionalCount: 1,

      unionCount: 2,
      referencedTypeCount: 3,

      genericDepth: 4,
      returnTypeDepth: 1,
    }

    expect(mergeComplexityMetrics([metrics1, metrics2])).toEqual({
      nestingDepth: 5,

      parameterCount: 7,
      optionalCount: 3,

      unionCount: 5,
      referencedTypeCount: 7,

      genericDepth: 4,
      returnTypeDepth: 2,
    })
  })

  it('merges multiple metrics entries', () => {
    const metricsArray: Array<ComplexityMetrics> = [
      {
        nestingDepth: 1,

        parameterCount: 1,
        optionalCount: 0,

        unionCount: 1,
        referencedTypeCount: 2,

        genericDepth: 0,
        returnTypeDepth: 1,
      },
      {
        nestingDepth: 3,

        parameterCount: 2,
        optionalCount: 1,

        unionCount: 2,
        referencedTypeCount: 1,

        genericDepth: 2,
        returnTypeDepth: 3,
      },
      {
        nestingDepth: 2,

        parameterCount: 3,
        optionalCount: 2,

        unionCount: 4,
        referencedTypeCount: 5,

        genericDepth: 1,
        returnTypeDepth: 2,
      },
    ]

    expect(mergeComplexityMetrics(metricsArray)).toEqual({
      nestingDepth: 3,

      parameterCount: 6,
      optionalCount: 3,

      unionCount: 7,
      referencedTypeCount: 8,

      genericDepth: 2,
      returnTypeDepth: 3,
    })
  })
})
