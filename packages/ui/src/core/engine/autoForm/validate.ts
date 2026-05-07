import {
  convertToSchemaObjectWithResult,
  CrudSchemaType,
  Fields,
  flattenIssues,
  resolveFieldErrorsFromIssue,
} from '@gyomu/shared/entity';
import { Result, Schema } from 'effect';

export function validateWithSchema<TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
  value: unknown,
) {
  console.log('form', JSON.stringify(value, null, 2));
  const result = convertToSchemaObjectWithResult(schema, value, true);

  console.log(result, JSON.stringify(result, null, 2));
  if (Result.isSuccess(result)) {
    return { ok: true as const, data: result.success };
  }

  return {
    ok: false as const,
    errors: resolveFieldErrorsFromIssue(schema, result.failure),
  };
}

export function validateField(fieldSchema: Schema.Schema<any>, value: unknown) {
  const result = convertToSchemaObjectWithResult(fieldSchema, value, true);
  if (Result.isSuccess(result)) {
    return { ok: true as const, data: result.success };
  }

  return {
    ok: false as const,
    errors: flattenIssues(result.failure),
  };
}
