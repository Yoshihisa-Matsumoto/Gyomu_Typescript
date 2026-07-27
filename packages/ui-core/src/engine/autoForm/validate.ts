import {
  convertToSchemaObjectWithResult,
  flattenIssues,
  resolveFieldErrorsFromIssue,
} from '@gyomu/schema/entity'
import { Result } from 'effect'
import type { CrudSchemaType, Fields } from '@gyomu/schema/entity'
import type { Schema } from 'effect'

/**
 * Validates an input value against a provided CRUD schema.
 *
 * @param schema The CRUD schema configuration to validate against.
 *
 * @param value The input value to be validated.
 *
 * @returns An object indicating success with the validated data or failure with a map of field errors.
 */
export function validateWithSchema<TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
  value: unknown,
) {
  console.log('form', JSON.stringify(value, null, 2))
  const result = convertToSchemaObjectWithResult(schema, value, true)

  console.log(result, JSON.stringify(result, null, 2))
  if (Result.isSuccess(result)) {
    return { ok: true as const, data: result.success }
  }

  return {
    ok: false as const,
    errors: resolveFieldErrorsFromIssue(schema, result.failure.issue),
  }
}

/**
 * Validates a single field value against a specific schema.
 *
 * @param fieldSchema The field schema to validate against.
 *
 * @param value The field value to be validated.
 *
 * @returns An object indicating success with the validated data or failure with a list of path-aware error messages.
 */
export function validateField(fieldSchema: Schema.Schema<any>, value: unknown) {
  const result = convertToSchemaObjectWithResult(fieldSchema, value, true)
  if (Result.isSuccess(result)) {
    return { ok: true as const, data: result.success }
  }

  return {
    ok: false as const,
    errors: flattenIssues(result.failure.issue),
  }
}
