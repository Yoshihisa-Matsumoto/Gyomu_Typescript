import type { DirectoryAnalysis } from '@gyomu/schema/concept'

type ScoredDirectory = {
  score: number
  directory: DirectoryAnalysis
}
const MAX_DIRECTORY_COUNT = 5
export const selectTopDirectories = (directories: ReadonlyArray<DirectoryAnalysis>) => {
  if (directories.length === 0) return []

  const maxPublicApiCount = Math.max(...directories.map((d) => d.facts.publicApiSymbolCount))
  const maxRootApiCount = Math.max(...directories.map((dir) => dir.facts.rootApiSymbolCount))

  const importanceOrder = {
    Core: 3,
    Supporting: 2,
    Utility: 1,
  } as const

  const scoredDirectories = directories
    .map((directory) => {
      const score = calculateScore(directory, maxPublicApiCount, maxRootApiCount)
      return {
        score,
        directory,
      }
    })
    .sort(compareDirectories)

  if (scoredDirectories.length > MAX_DIRECTORY_COUNT)
    return scoredDirectories.slice(0, MAX_DIRECTORY_COUNT).map((d) => d.directory)
  return scoredDirectories.map((d) => d.directory)
}

const importanceOrder = {
  Core: 3,
  Supporting: 2,
  Utility: 1,
} as const

const compareDirectories = (a: ScoredDirectory, b: ScoredDirectory) => {
  const scoreDiff = b.score - a.score
  if (scoreDiff !== 0) {
    return scoreDiff
  }

  return (
    importanceOrder[b.directory.concept.importance] -
    importanceOrder[a.directory.concept.importance]
  )
}

export const calculateScore = (
  entry: DirectoryAnalysis,
  maxPublicApiCount: number,
  maxRootApiCount: number,
): number => {
  const importance = entry.concept.importance
  const importanceScore = importance == 'Core' ? 50 : importance == 'Supporting' ? 30 : 15
  const publicScore =
    maxPublicApiCount === 0 ? 0 : (entry.facts.publicApiSymbolCount / maxPublicApiCount) * 35
  const rootApiScore =
    maxRootApiCount === 0 ? 0 : (entry.facts.rootApiSymbolCount / maxRootApiCount) * 15

  return importanceScore + publicScore + rootApiScore
}
