import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

export type DocumentBuildPhase =
  'context-build' | 'section-build' | 'document-build' | 'translate' | 'render' | 'export'

export interface DocumentBuilderErrorContext extends AppErrorContext {
  /**
   * Target package name.
   */
  readonly packageName: string

  /**
   * Target file or output path being processed.
   */
  readonly filePath: string

  /**
   * Phase where the error occurred.
   */
  readonly phase: DocumentBuildPhase

  /**
   * Optional document section currently being generated.
   */
  readonly sectionId?: string
}

export class DocumentBuilderError extends withErrorTraits(
  Data.TaggedError('@gyomu/concept/DocumentBuilderError')<DocumentBuilderErrorContext>,
) {}
