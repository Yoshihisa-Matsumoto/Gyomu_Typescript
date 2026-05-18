import { tool } from 'ai'
import { Schema } from 'effect'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { AiTool } from '../ai-tool.js'

export const toVercelTool = <Input extends EffectSchema, Output extends Schema.Top>(
  toolDef: AiTool<string, Input, Output>,
) => {
  return tool({
    description: toolDef.description,

    inputSchema: Schema.toStandardJSONSchemaV1(Schema.toStandardSchemaV1(toolDef.inputSchema)),

    execute: (input) => toolDef.execute(input as Schema.Schema.Type<Input>),
  })
}
