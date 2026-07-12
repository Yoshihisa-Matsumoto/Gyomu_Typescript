import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileChange } from '@gyomu/schema/snapshot'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export interface BuildResult {
  concept: DirectoryConcept
  changed: boolean
}

export type BuildDirectoryOption = {
  targetFolder?: ProjectRelativePath
  changedFiles?: Array<FileChange>
} & ConceptOptions
