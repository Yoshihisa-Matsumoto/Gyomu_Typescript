import { tool } from 'ai'
import { Schema } from 'effect'
import type { Tool } from 'ai'
import type { StandardJSONSchemaV1 } from '@standard-schema/spec'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { AiTool } from '../ai-tool.js'
import type { JsonValue } from 'effect/testing/FastCheck'
import type { ToolResult } from '@gyomu/schema'

export const toVercelTool = <Input extends EffectSchema, Output extends JsonValue>(
  toolDef: AiTool<string, Input, Output>,
): Tool<
  (StandardJSONSchemaV1<Input['Encoded'], Input['Type']> & Input)['Type'] & Input['Type'],
  ToolResult<Output>
> => {
  const result = tool({
    description: toolDef.description,

    inputSchema: Schema.toStandardSchemaV1(Schema.toStandardJSONSchemaV1(toolDef.inputSchema)),

    execute: (input) => toolDef.execute(input as Schema.Schema.Type<Input>),
  })
  return result
}
