import { describe, expect, it } from 'vitest'
import { computeProtectedSections } from '../computeProtectedSections.js'
import type { HumanEditSignal } from '@gyomu/schema/schemas/typescript'

describe('computeProtectedRegionsFromHumanEditSignals', () => {
  it('returns empty when signals are empty', () => {
    expect(computeProtectedSections([])).toEqual([])
  })

  it('ignores sections whose total score is less than 1', () => {
    const signals: Array<HumanEditSignal> = [
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          targetSection: 'remarks',
        },
      },
    ]

    expect(computeProtectedSections(signals)).toEqual([])
  })

  it('creates a protected section when score is 1 or greater', () => {
    const signals: Array<HumanEditSignal> = [
      {
        type: 'manual-format',
        score: 1,
        details: {
          targetSection: 'remarks',
        },
      },
    ]

    expect(computeProtectedSections(signals)).toEqual([
      {
        targetSection: 'remarks',
        score: 1,
      },
    ])
  })

  it('aggregates scores for the same target section', () => {
    const signals: Array<HumanEditSignal> = [
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          targetSection: 'remarks',
        },
      },
      {
        type: 'complex-markdown',
        score: 0.6,
        details: {
          targetSection: 'remarks',
        },
      },
    ]

    expect(computeProtectedSections(signals)).toEqual([
      {
        targetSection: 'remarks',
        score: 1.2,
      },
    ])
  })

  it('evaluates each target section independently', () => {
    const signals: Array<HumanEditSignal> = [
      {
        type: 'manual-format',
        score: 0.6,
        details: {
          targetSection: 'remarks',
        },
      },
      {
        type: 'complex-markdown',
        score: 0.6,
        details: {
          targetSection: 'remarks',
        },
      },
      {
        type: 'custom-example',
        score: 0.8,
        details: {
          targetSection: 'example',
        },
      },
    ]

    expect(computeProtectedSections(signals)).toEqual([
      {
        targetSection: 'remarks',
        score: 1.2,
      },
    ])
  })
})
