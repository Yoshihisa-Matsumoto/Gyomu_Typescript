import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

export type ConceptPhase =
  | 'context-build'
  | 'file-summary'
  | 'directory-summary'
  | 'package-concept'
  | 'concept-build'
  | 'export'

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

export class ConceptError extends withErrorTraits(
  Data.TaggedError('@gyomu/concept/ConceptError')<ConceptErrorContext>,
) {}
