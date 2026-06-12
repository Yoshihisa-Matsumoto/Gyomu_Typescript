import { describe, expect, it } from 'vitest'

import { computeEffectComplexity } from '../computeEffectComplexity.js'
import type { EffectSignals } from '@gyomu/schema/typescript'

describe('computeEffectComplexity', () => {
  it('returns base complexity when no effect features are present', () => {
    const signals = {} as EffectSignals

    expect(computeEffectComplexity(signals)).toBe(1)
  })

  it('adds complexity based on effect depth', () => {
    const signals = {
      effectDepth: 3,
    } as EffectSignals

    expect(computeEffectComplexity(signals)).toBe(3)
    // base 1 + (3 - 1)
  })

  it('adds complexity when returning an Effect', () => {
    const signals = {
      returnsEffect: true,
    } as EffectSignals

    expect(computeEffectComplexity(signals)).toBe(3)
    // base 1 + 2
  })

  it('adds complexity for union error types', () => {
    const signals = {
      error: {
        structure: {
          kind: 'union',
          types: [{}, {}, {}],
        },
      },
    } as EffectSignals

    expect(computeEffectComplexity(signals)).toBe(7)
    // base 1 + (3 * 2)
  })

  it('does not add complexity for non-union error types', () => {
    const signals = {
      error: {
        structure: {
          kind: 'reference',
        },
      },
    } as EffectSignals

    expect(computeEffectComplexity(signals)).toBe(1)
  })

  it('adds complexity for union requirement types', () => {
    const signals = {
      requirements: {
        structure: {
          kind: 'union',
          types: [{}, {}],
        },
      },
    } as EffectSignals

    expect(computeEffectComplexity(signals)).toBe(7)
    // base 1 + (2 * 3)
  })

  it('does not add complexity for non-union requirement types', () => {
    const signals = {
      requirements: {
        structure: {
          kind: 'reference',
        },
      },
    } as EffectSignals

    expect(computeEffectComplexity(signals)).toBe(1)
  })

  it('combines all complexity sources', () => {
    const signals = {
      effectDepth: 4,
      returnsEffect: true,
      error: {
        structure: {
          kind: 'union',
          types: [{}, {}],
        },
      },
      requirements: {
        structure: {
          kind: 'union',
          types: [{}, {}, {}],
        },
      },
    } as EffectSignals

    expect(computeEffectComplexity(signals)).toBe(19)

    // base: 1
    // effectDepth: +3
    // returnsEffect: +2
    // error union (2): +4
    // requirements union (3): +9
    // total: 19
  })
})
