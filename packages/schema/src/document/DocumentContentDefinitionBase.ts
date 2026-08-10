import type { DocumentContent } from '../schemas/document/DocumentContent.js'
import type { Schema } from 'effect'

type DocumentContentSchema = Schema.Schema<{
  readonly type: DocumentContent['type']
}>

/**
 * Defines the base structure for document content definitions, including the schema, type identifier, reconciliation validator, and translation instructions.
 */
export type DocumentContentDefinitionBase<T extends DocumentContentSchema> = {
  readonly type: Schema.Schema.Type<T>['type']

  readonly schema: T

  readonly reconciliation: ReconciliationValidator<T>

  readonly translationInstruction: string
}

/**
 * Represents the outcome of a validation process, containing a list of issues and a flag indicating success.
 */
export interface ValidationResult {
  /**
   * A collection of issues found during validation.
   */
  readonly issues: ReadonlyArray<ValidationIssue>

  /**
   * Indicates whether the validation was successful.
   */
  readonly isValid: boolean
}

/**
 * Describes a specific validation failure, including an error code, message, optional context, and instructions for repair.
 */
export interface ValidationIssue {
  /**
   * A unique identifier for the validation error type.
   */
  readonly code: string

  /**
   * A human-readable description of the error.
   */
  readonly message: string

  /**
   * An optional identifier for external translation or localization resources associated with this error.
   */
  readonly translationId?: number | undefined

  /**
   * Optional additional metadata providing context for the validation issue.
   */
  readonly details?: Readonly<Record<string, string>>

  /**
   * Guidance on how to resolve the validation error.
   */
  readonly repairInstruction: string
}

interface ReconciliationValidator<T extends DocumentContentSchema> {
  validate: (source: Schema.Schema.Type<T>, translated: Schema.Schema.Type<T>) => ValidationResult
}
