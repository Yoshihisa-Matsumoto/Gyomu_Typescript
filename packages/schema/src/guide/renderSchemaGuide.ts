import { renderyaml } from './renderYaml.js'
import { normalizeSchema } from './normalizeSchema.js'
import type { NormalizeSchemaOptions } from './normalizeSchema.js'
import type { Schema } from 'effect'

/**
 * Renders a Schema guide as a YAML-formatted string.
 *
 * @param schema The schema definition to render.
 *
 * @param option Optional configuration for schema normalization.
 *
 * @returns A YAML string representing the rendered schema guide.
 */
export const renderSchemaGuide = (
  schema: Schema.Schema<any>,
  option?: NormalizeSchemaOptions,
): string => {
  return renderyaml(normalizeSchema(schema, option), 0)
}
