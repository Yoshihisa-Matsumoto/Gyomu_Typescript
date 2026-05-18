import type { ToolResult } from '@gyomu/schema'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { Schema } from 'effect'
import type { JsonValue } from 'effect/testing/FastCheck'

export interface AiTool<Name extends string, Input extends EffectSchema, Output extends JsonValue> {
  readonly name: Name

  readonly description: string

  readonly inputSchema: Input

  readonly execute: (input: Schema.Schema.Type<Input>) => Promise<ToolResult<Output>>
}
