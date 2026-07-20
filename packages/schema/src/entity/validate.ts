import { Schema } from 'effect'
import { convertToSchemaObjectWithResult } from './convert.js'
import type { CrudSchemaType, Fields } from './type.js'

/**
 * Validates an unknown object value against a specific field schema derived from a CRUD schema definition.
 *
 * @param schema The CRUD schema containing the field definitions.
 *
 * @param fieldName The name of the field to validate within the schema.
 *
 * @param value The unknown value to validate.
 *
 * @returns The result of the schema conversion and validation process.
 */
export const validateUnknowObject = <TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
  fieldName: string,
  value: any,
) => {
  const fieldSchema = getFieldSchema(schema, fieldName)

  const result = convertToSchemaObjectWithResult(fieldSchema, value, true)
  return result
}

const getFieldSchema = <TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
  fieldName: string,
) => {
  const ast = schema.ast

  const prop = ast.propertySignatures.find((p) => p.name === fieldName)

  if (!prop) {
    throw new Error(`Field not found: ${fieldName}`)
  }

  return Schema.make(prop.type)
}
