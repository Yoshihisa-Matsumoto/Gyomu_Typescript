import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'
import type { DocumentContent } from '../schemas/document/DocumentContent.js'

/**
 * Defines the distinct phases of the translation pipeline.
 */
export type TranslationPhase =
  'translate' | 'schema-validation' | 'reconciliation' | 'retry-context' | 'retry' | 'prompt'

/**
 * Contextual information for an error occurring during document translation.
 */
export interface TranslationErrorContext extends AppErrorContext {
  /**
   * Translation phase where the error occurred.
   */
  readonly phase: TranslationPhase

  /**
   * Target document section.
   */
  readonly sectionId: string

  /**
   * Target document content type.
   */
  readonly contentType: DocumentContent['type']

  /**
   * Optional translation identifier associated with the error.
   */
  readonly translationId?: number

  /**
   * Optional validation issue code related to the error.
   */
  readonly validationCode?: string
}

/**
 * Represents an unexpected error during the translation pipeline.
 */
export class TranslationError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/TranslationError')<TranslationErrorContext>,
) {}
