import { describe, expect, it } from 'vitest'
import { analyzePackageAnalysis } from '../analyzePackageAnalysis.js'
import { createDirectoryAnalysis } from '../../__tests__/helpers/createDirectoryAnalysis.js'
import { createPackageAnalysis } from '../../__tests__/helpers/createPackageAnalysis.js'
import type { PackageAnalysis } from '@gyomu/schema/concept'

const packageAnalysis: PackageAnalysis = createPackageAnalysis({
  package: {},
  exports: [],
  dependencies: [],
  directories: [
    createDirectoryAnalysis('utility', 'Utility', 1, 0),
    createDirectoryAnalysis('support', 'Supporting', 10, 5),
    createDirectoryAnalysis('core-a', 'Core', 50, 30),
    createDirectoryAnalysis('core-b', 'Core', 40, 20),
  ],
})

describe('analyzePackageAnalysis', () => {
  it('returns all ranked directories when top-score has no limit', () => {
    const facts = analyzePackageAnalysis(packageAnalysis)

    const result = facts.getRankedDirectories({
      strategy: 'top-score',
    })

    expect(result).toHaveLength(4)

    // rankDirectoriesByScoreの結果を利用していることだけ確認
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(result[0]!.concept.importance).toBe('Core')
  })

  it('returns limited ranked directories', () => {
    const facts = analyzePackageAnalysis(packageAnalysis)

    const result = facts.getRankedDirectories({
      strategy: 'top-score',
      limit: 2,
    })

    expect(result).toHaveLength(2)
    expect(result.every((d) => d.concept.importance === 'Core')).toBe(true)
  })

  it('returns directories by importance', () => {
    const facts = analyzePackageAnalysis(packageAnalysis)

    const result = facts.getRankedDirectories({
      strategy: 'importance',
      limits: {
        Core: 10,
        Supporting: 10,
        Utility: 10,
      },
    })

    expect(result.map((d) => d.path)).toEqual(['core-a', 'core-b', 'support', 'utility'])
  })

  it('respects importance limits', () => {
    const facts = analyzePackageAnalysis(packageAnalysis)

    const result = facts.getRankedDirectories({
      strategy: 'importance',
      limits: {
        Core: 1,
        Supporting: 0,
        Utility: 1,
      },
    })

    expect(result.map((d) => d.path)).toEqual(['core-a', 'utility'])
  })
  it('returns empty array when all limits are zero', () => {
    const facts = analyzePackageAnalysis(packageAnalysis)

    const result = facts.getRankedDirectories({
      strategy: 'importance',
      limits: {
        Core: 0,
        Supporting: 0,
        Utility: 0,
      },
    })

    expect(result).toEqual([])
  })
})
