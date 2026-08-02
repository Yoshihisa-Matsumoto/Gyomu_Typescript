import { typedKeys } from '@gyomu/schema'
import { rankDirectoriesByScore } from './rankDirectoriesByScore.js'
import type { PackageAnalysis } from '@gyomu/schema/concept'
import type { DirectorySelectionOption, PackageFacts } from './PackageFacts.js'

export const analyzePackageAnalysis = (packageAnalysis: PackageAnalysis): PackageFacts => {
  return {
    // rankedDirectories: rankDirectoriesByScore(packageAnalysis.directories),
    getRankedDirectories: (option: DirectorySelectionOption) => {
      if (option.strategy == 'top-score') {
        if (!option.limit) return rankDirectoriesByScore(packageAnalysis.directories)

        return rankDirectoriesByScore(packageAnalysis.directories).slice(0, option.limit)
      }

      return typedKeys(option.limits).flatMap((importance) =>
        packageAnalysis.directories
          .filter((directory) => directory.concept.importance === importance)
          .slice(0, option.limits[importance]),
      )
    },
  }
}
