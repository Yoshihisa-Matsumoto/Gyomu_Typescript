import type { FileChange } from '@gyomu/schema/snapshot'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { AiOptions, AnalysisOptions } from '@gyomu/schema'

/**
 * Options for configuring concept analysis, extending base analysis and AI configuration with target-specific paths and change tracking.
 */
export interface ConceptOptions extends AnalysisOptions, AiOptions {
  /**
   * Debugging information for concept analysis, including granular flags for directory and package level insights.
   */
  debugInfo?: AnalysisOptions['debugInfo'] &
    AiOptions['debugInfo'] & {
      DirectoryConcept?: boolean
      PackageConcept?: boolean
      PackageAnalysis?: boolean
      ReadmeSections?: boolean
    }

  /**
   * An optional project-relative path identifying the specific folder to focus analysis on.
   */
  targetFolder?: ProjectRelativePath | undefined

  /**
   * An optional list of changed files to consider during the analysis process.
   */
  changedFiles?: ReadonlyArray<FileChange> | undefined
}
