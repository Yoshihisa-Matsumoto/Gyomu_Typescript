import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

/**
 * Represents the specific stage in the code analysis pipeline.
 */
export type AnalysisPhase =
  | 'project-load'
  | 'source-file-load'
  | 'export-extract'
  | 'symbol-extract'
  | 'jsdoc-extract'
  | 'analysis'
  | 'post-analysis'

/**
 * Provides context for errors occurring during the analysis process, including the target file and the specific analysis phase.
 */
export interface AnalysisErrorContext extends AppErrorContext {
  /**
   * Target file path being analyzed.
   */
  readonly filePath: string

  /**
   * Analysis phase where the error occurred.
   */
  readonly phase: AnalysisPhase
}

/**
 * Represents an error encountered during the TS analysis process, annotated with AnalysisErrorContext.
 */
export class AnalysisError extends withErrorTraits(
  Data.TaggedError('@gyomu/agent/tsdoc/AnalysisError')<AnalysisErrorContext>,
) {}
