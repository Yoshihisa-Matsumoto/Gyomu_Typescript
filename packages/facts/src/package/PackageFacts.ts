import type { DirectoryAnalysis } from '@gyomu/schema/concept'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'

/**
 * Defines configuration options for selecting directories, supporting either a top-score strategy with an optional limit or an importance-based strategy with specific limits per importance level.
 */
export type DirectorySelectionOption =
  | {
      strategy: 'top-score'
      limit?: number
    }
  | {
      strategy: 'importance'
      limits: Record<DirectoryConcept['importance'], number>
    }

/**
 * Represents a collection of facts derived from a package, providing methods to analyze and rank directories.
 */
export interface PackageFacts {
  /**
   * Retrieves an array of ranked directory analyses based on the specified selection options.
   *
   * @param option The configuration for directory selection strategy and constraints.
   *
   * @returns An array of DirectoryAnalysis objects representing the ranked directories.
   */
  getRankedDirectories: (option: DirectorySelectionOption) => Array<DirectoryAnalysis>
}
