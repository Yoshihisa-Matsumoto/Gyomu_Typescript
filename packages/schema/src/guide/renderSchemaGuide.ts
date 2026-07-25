import { renderyaml } from './renderYaml.js'
import { normalizeSchema } from './normalizeSchema.js'
import type { NormalizeSchemaOptions } from './normalizeSchema.js'
import type { Schema } from 'effect'

export const renderSchemaGuide = (
  schema: Schema.Schema<any>,
  option?: NormalizeSchemaOptions,
): string => {
  return renderyaml(normalizeSchema(schema, option), 0)
}
