import type { FileChange } from '@gyomu/schema/snapshot'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { AiOptions, AnalysisOptions } from '@gyomu/schema'

export interface ConceptOptions extends AnalysisOptions, AiOptions {
  debugInfo?: AnalysisOptions['debugInfo'] &
    AiOptions['debugInfo'] & {
      DirectoryConcept?: boolean
      PackageConcept?: boolean
      PackageAnalysis?: boolean
      PackageInsight?: boolean
    }
  targetFolder?: ProjectRelativePath | undefined
  changedFiles?: ReadonlyArray<FileChange> | undefined
}
