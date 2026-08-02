import type { DirectoryAnalysis } from '@gyomu/schema/concept'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'

export type DirectorySelectionOption =
  | {
      strategy: 'top-score'
      limit?: number
    }
  | {
      strategy: 'importance'
      limits: Record<DirectoryConcept['importance'], number>
    }

export interface PackageFacts {
  getRankedDirectories: (option: DirectorySelectionOption) => Array<DirectoryAnalysis>
}
