import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

/**
 * Defines the distinct phases of the document build lifecycle.
 */
export type DocumentBuildPhase =
  'context-build' | 'section-build' | 'document-build' | 'translate' | 'render' | 'export'

/**
 * Defines the contextual information for an error occurring during the document build process.
 */
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

/**
 * Represents an error that occurred during the document building process.
 */
export class DocumentBuilderError extends withErrorTraits(
  Data.TaggedError('@gyomu/concept/DocumentBuilderError')<DocumentBuilderErrorContext>,
) {}
