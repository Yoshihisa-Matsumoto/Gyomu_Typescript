import { describe, expect, it } from 'vitest'

import { calculateScore, rankDirectoriesByScore } from '../rankDirectoriesByScore.js'
import { createDirectory } from '../../__tests__/helpers/createDirectory.js'

describe('rankDirectoriesByImportance', () => {
  describe('rankDirectoriesByImportance', () => {
    it('Importanceが同じならpublicApiSymbolCount順になる', () => {
      const directories = [
        createDirectory({
          path: 'small',
          concept: { importance: 'Core' },
          facts: {
            publicApiSymbolCount: 1,
            rootApiSymbolCount: 1,
          },
        }),
        createDirectory({
          path: 'large',
          concept: { importance: 'Core' },
          facts: {
            publicApiSymbolCount: 10,
            rootApiSymbolCount: 1,
          },
        }),
      ]

      const result = rankDirectoriesByScore(directories)

      expect(result.map((d) => d.path)).toEqual(['large', 'small'])
    })

    it('Importance・publicApiが同じならrootApiSymbolCount順になる', () => {
      const directories = [
        createDirectory({
          path: 'small',
          concept: { importance: 'Core' },
          facts: {
            publicApiSymbolCount: 10,
            rootApiSymbolCount: 1,
          },
        }),
        createDirectory({
          path: 'large',
          concept: { importance: 'Core' },
          facts: {
            publicApiSymbolCount: 10,
            rootApiSymbolCount: 5,
          },
        }),
      ]

      const result = rankDirectoriesByScore(directories)

      expect(result.map((d) => d.path)).toEqual(['large', 'small'])
    })

    it('空配列なら空配列を返す', () => {
      expect(rankDirectoriesByScore([])).toEqual([])
    })

    it('API数がすべて0でもNaNにならず並び替えできる', () => {
      const directories = [
        createDirectory({
          path: 'support',
          concept: { importance: 'Supporting' },
        }),
        createDirectory({
          path: 'core',
          concept: { importance: 'Core' },
        }),
        createDirectory({
          path: 'utility',
          concept: { importance: 'Utility' },
        }),
      ]

      const result = rankDirectoriesByScore(directories)

      expect(result.map((d) => d.path)).toEqual(['core', 'support', 'utility'])
    })
  })

  describe('calculateScore', () => {
    it('Core の重みを加算する', () => {
      const directory = createDirectory({
        concept: { importance: 'Core' },
      })

      expect(calculateScore(directory, 10, 10)).toBe(50)
    })

    it('Supporting の重みを加算する', () => {
      const directory = createDirectory({
        concept: { importance: 'Supporting' },
      })

      expect(calculateScore(directory, 10, 10)).toBe(30)
    })

    it('Utility の重みを加算する', () => {
      const directory = createDirectory({
        concept: { importance: 'Utility' },
      })

      expect(calculateScore(directory, 10, 10)).toBe(15)
    })

    it('publicApiSymbolCount をスコアへ反映する', () => {
      const directory = createDirectory({
        facts: { publicApiSymbolCount: 5 },
      })

      // 30 + (5 / 10 * 35) = 47.5
      expect(calculateScore(directory, 10, 10)).toBeCloseTo(47.5)
    })

    it('rootApiSymbolCount をスコアへ反映する', () => {
      const directory = createDirectory({
        facts: { rootApiSymbolCount: 4 },
      })

      // 30 + (4 / 10 * 15) = 36
      expect(calculateScore(directory, 10, 10)).toBeCloseTo(36)
    })

    it('すべて最大値なら100点になる', () => {
      const directory = createDirectory({
        concept: { importance: 'Core' },
        facts: { publicApiSymbolCount: 20, rootApiSymbolCount: 8 },
      })

      expect(calculateScore(directory, 20, 8)).toBe(100)
    })

    it('API数が0ならImportanceのみになる', () => {
      const directory = createDirectory({
        concept: { importance: 'Supporting' },
      })

      expect(calculateScore(directory, 10, 10)).toBe(30)
    })

    it('最大API数が0でもNaNにならない', () => {
      const directory = createDirectory({
        concept: { importance: 'Core' },
      })

      expect(calculateScore(directory, 0, 0)).toBe(50)
    })
  })
})
