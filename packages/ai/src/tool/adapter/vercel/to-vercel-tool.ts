import { tool } from 'ai'
import { Schema } from 'effect'
import type { Tool } from 'ai'
import type { StandardJSONSchemaV1 } from '@standard-schema/spec'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { AiTool, ToolResult } from '../../ai-tool.js'
import type { JsonValue } from '@gyomu/schema'

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

    inputSchema: Schema.toStandardSchemaV1(Schema.toStandardJSONSchemaV1(toolDef.inputSchema)),

    execute: (input) =>
      toolDef.execute(
        input as Schema.Schema.Type<Input>,
        undefined as any as Schema.Schema.Type<ConfigSchema>,
      ),
  })
  return result
}
