import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'

export interface BuildResult {
  concept: DirectoryConcept
  changed: boolean
}

// export type BuildDirectoryOption = {
//   targetFolder?: ProjectRelativePath | undefined
//   changedFiles?: ReadonlyArray<FileChange> | undefined
// } & ConceptOptions
