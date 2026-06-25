import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

interface SchemaErrorContext extends AppErrorContext {
  schemaName: string
  phase: 'decode' | 'encode'
  issues?: unknown // SchemaErrorの詳細
}

/**
 * Represents a validation error in the schema, containing context regarding the validation failure.
 */
export class SchemaValidationError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/SchemaErrorContext')<SchemaErrorContext>,
) {}
