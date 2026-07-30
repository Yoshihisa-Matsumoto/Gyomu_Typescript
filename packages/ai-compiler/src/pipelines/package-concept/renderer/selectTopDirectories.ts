// import type { DirectoryAnalysis } from '@gyomu/schema/concept'

// type ScoredDirectory = {
//   score: number
//   directory: DirectoryAnalysis
// }
// const MAX_DIRECTORY_COUNT = 5

// /**
//  * Selects and returns the most important directories based on API symbol density and architectural importance.
//  *
//  * @param directories The list of directory analysis records to filter.
//  *
//  * @returns A subset of the provided directories, ranked by calculated importance.
//  */
// export const selectTopDirectories = (directories: ReadonlyArray<DirectoryAnalysis>) => {
//   if (directories.length === 0) return []

//   const maxPublicApiCount = Math.max(...directories.map((d) => d.facts.publicApiSymbolCount))
//   const maxRootApiCount = Math.max(...directories.map((dir) => dir.facts.rootApiSymbolCount))

//   const importanceOrder = {
//     Core: 3,
//     Supporting: 2,
//     Utility: 1,
//   } as const

//   const scoredDirectories = directories
//     .map((directory) => {
//       const score = calculateScore(directory, maxPublicApiCount, maxRootApiCount)
//       return {
//         score,
//         directory,
//       }
//     })
//     .sort(compareDirectories)

//   if (scoredDirectories.length > MAX_DIRECTORY_COUNT)
//     return scoredDirectories.slice(0, MAX_DIRECTORY_COUNT).map((d) => d.directory)
//   return scoredDirectories.map((d) => d.directory)
// }

// const importanceOrder = {
//   Core: 3,
//   Supporting: 2,
//   Utility: 1,
// } as const

// const compareDirectories = (a: ScoredDirectory, b: ScoredDirectory) => {
//   const scoreDiff = b.score - a.score
//   if (scoreDiff !== 0) {
//     return scoreDiff
//   }

//   return (
//     importanceOrder[b.directory.concept.importance] -
//     importanceOrder[a.directory.concept.importance]
//   )
// }

// /**
//  * Calculates an importance score for a directory based on public API density and architectural metadata.
//  *
//  * @param entry The directory analysis record.
//  *
//  * @param maxPublicApiCount The maximum public API count found across all evaluated directories.
//  *
//  * @param maxRootApiCount The maximum root API count found across all evaluated directories.
//  *
//  * @returns A numeric score representing the directory's priority.
//  */
// export const calculateScore = (
//   entry: DirectoryAnalysis,
//   maxPublicApiCount: number,
//   maxRootApiCount: number,
// ): number => {
//   const importance = entry.concept.importance
//   const importanceScore = importance == 'Core' ? 50 : importance == 'Supporting' ? 30 : 15
//   const publicScore =
//     maxPublicApiCount === 0 ? 0 : (entry.facts.publicApiSymbolCount / maxPublicApiCount) * 35
//   const rootApiScore =
//     maxRootApiCount === 0 ? 0 : (entry.facts.rootApiSymbolCount / maxRootApiCount) * 15

//   return importanceScore + publicScore + rootApiScore
// }
