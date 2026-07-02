import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

export type AnalysisPhase =
  | 'project-load'
  | 'source-file-load'
  | 'export-extract'
  | 'symbol-extract'
  | 'jsdoc-extract'
  | 'analysis'

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

export class AnalysisError extends withErrorTraits(
  Data.TaggedError('@gyomu/agent/tsdoc/AnalysisError')<AnalysisErrorContext>,
) {}
