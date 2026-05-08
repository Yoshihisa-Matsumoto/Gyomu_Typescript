import { Schema } from 'effect';
import { CrudSchemaType, Fields } from './type.js';

export const buildFieldSchemaMap = <TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
) => {
  const ast = schema.ast;

  const entries = ast.propertySignatures.map((p) => [
    p.name,
    Schema.make(p.type),
  ]);

  return Object.fromEntries(entries) as Record<
    keyof TFields,
    Schema.Schema<any>
  >;
};
