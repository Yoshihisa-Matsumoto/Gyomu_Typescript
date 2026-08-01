import type { DocumentContent } from '../schemas/document/DocumentContent.js'
import type { Schema } from 'effect'

type DocumentContentSchema = Schema.Schema<{
  readonly type: DocumentContent['type']
}>

export type DocumentContentDefinitionBase<T extends DocumentContentSchema> = {
  readonly type: Schema.Schema.Type<T>['type']

  readonly schema: T

  readonly reconciliation: ReconciliationValidator<T>

  readonly translationInstruction: string
}

export interface ValidationResult {
  readonly issues: ReadonlyArray<ValidationIssue>

  readonly isValid: boolean
}
export interface ValidationIssue {
  readonly code: string

  readonly message: string

  readonly translationId?: number | undefined

  readonly details?: Readonly<Record<string, string>>

  readonly repairInstruction: string
}

interface ReconciliationValidator<T extends DocumentContentSchema> {
  validate: (source: Schema.Schema.Type<T>, translated: Schema.Schema.Type<T>) => ValidationResult
}
