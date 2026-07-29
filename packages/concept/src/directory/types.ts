import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'

/**
 * Represents the result of a directory build operation, containing the resulting directory concept and a flag indicating whether changes occurred.
 */
export interface BuildResult {
  /**
   * The processed directory concept.
   */
  concept: DirectoryConcept

  /**
   * Indicates whether the build resulted in any modifications.
   */
  changed: boolean
}

// export type BuildDirectoryOption = {
//   targetFolder?: ProjectRelativePath | undefined
//   changedFiles?: ReadonlyArray<FileChange> | undefined
// } & ConceptOptions
