import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

/**
 * Defines the discrete phases of the concept generation process.
 */
export type ConceptPhase =
  | 'context-build'
  | 'file-summary'
  | 'directory-summary'
  | 'package-concept'
  | 'concept-build'
  | 'export'

/**
 * Contextual metadata for errors occurring within the concept generation process, extending standard error traits with specific processing details.
 */
export interface ConceptErrorContext extends AppErrorContext {
  /**
   * Target package name
   */
  readonly packageName: string

  /**
   * Target file/directory path being processed.
   */
  readonly filePath: string

  /**
   * Phase where the error occurred.
   */
  readonly phase: ConceptPhase

  /**
   * Optional symbol currently being processed.
   */
  readonly symbolId?: string
}

/**
 * An error class for failures within the concept generation process, carrying `ConceptErrorContext` metadata.
 */
export class ConceptError extends withErrorTraits(
  Data.TaggedError('@gyomu/concept/ConceptError')<ConceptErrorContext>,
) {}
