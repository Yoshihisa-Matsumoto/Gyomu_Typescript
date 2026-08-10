import { tool } from 'ai'
import { toJsonSchema } from '@gyomu/schema/entity'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { Schema } from 'effect'
import type { Tool } from 'ai'
import type { StandardJSONSchemaV1 } from '@standard-schema/spec'
import type { AiTool, ToolResult } from '../../ai-tool.js'
import type { JsonValue } from '@gyomu/schema'

/**
 * Converts an internal `AiTool` definition into a Vercel-compatible `Tool` object, mapping the schema and execution logic.
 *
 * @param toolDef The AI tool definition containing description, input schema, and execution logic.
 *
 * @returns A Vercel-compatible Tool instance configured with the provided schema and execution handler.
 */
export const toVercelTool = <
  Input extends EffectSchema,
  Output extends JsonValue,
  ConfigSchema extends EffectSchema = never,
>(
  toolDef: AiTool<Input, Output, ConfigSchema>,
): Tool<
  (StandardJSONSchemaV1<Input['Encoded'], Input['Type']> & Input)['Type'] & Input['Type'],
  ToolResult<Output>
> => {
  const result = tool({
    description: toolDef.description,

    inputSchema: toJsonSchema(toolDef.inputSchema),

    execute: (input) =>
      toolDef.execute(
        input as Schema.Schema.Type<Input>,
        undefined as any as Schema.Schema.Type<ConfigSchema>,
      ),
  })
  return result
}
