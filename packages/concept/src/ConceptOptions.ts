import type { AiOptions, AnalysisOptions } from '@gyomu/schema'
import { FileChange } from '@gyomu/schema/snapshot'
import { ProjectRelativePath } from '@gyomu/schema/typescript'

export interface ConceptOptions extends AnalysisOptions, AiOptions {
  debugInfo?: AnalysisOptions['debugInfo'] &
    AiOptions['debugInfo'] & {
      DirectoryConcept?: boolean
    }
  targetFolder?: ProjectRelativePath | undefined
  changedFiles?: ReadonlyArray<FileChange> | undefined
}
