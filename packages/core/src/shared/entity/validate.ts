import { Schema } from 'effect';
import { convertToSchemaObjectWithResult } from './convert.js';
import { CrudSchemaType, Fields } from './type.js';

export const validateUnknowObject = <TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
  fieldName: string,
  value: any,
) => {
  const fieldSchema = getFieldSchema(schema, fieldName);

  const result = convertToSchemaObjectWithResult(fieldSchema, value, true);
};

const getFieldSchema = <TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
  fieldName: string,
) => {
  const ast = schema.ast;

  const prop = ast.propertySignatures.find((p) => p.name === fieldName);

  if (!prop) {
    throw new Error(`Field not found: ${fieldName}`);
  }

  return Schema.make(prop.type);
};
