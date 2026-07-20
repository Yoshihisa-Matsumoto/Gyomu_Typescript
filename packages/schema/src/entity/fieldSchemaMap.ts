import { Schema } from 'effect'
import type { CrudSchemaType, Fields } from './type.js'

/**
 * Constructs a map of field names to their corresponding schemas from a given CRUD schema AST.
 *
 * @param schema The CRUD schema object containing the AST structure.
 *
 * @returns An object where keys are field names and values are the corresponding schema definitions.
 */
export const buildFieldSchemaMap = <TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
) => {
  const ast = schema.ast

  const entries = ast.propertySignatures.map((p) => [p.name, Schema.make(p.type)])

  return Object.fromEntries(entries) as Partial<Record<keyof TFields, Schema.Schema<any>>>
}
