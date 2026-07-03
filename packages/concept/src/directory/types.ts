import type { DirectoryConcept } from '@gyomu/ai-compiler/directory-concept'
import type { FileChange } from '@gyomu/schema/snapshot'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export interface BuildResult {
  concept: DirectoryConcept
  changed: boolean
}

export type BuildDirectoryOption = {
  targetFolder?: ProjectRelativePath
  changedFiles?: Array<FileChange>
}
