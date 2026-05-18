import type { ResultType } from '@gyomu/schema'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { Schema } from 'effect'

export interface AiTool<
  Name extends string,
  Input extends EffectSchema,
  Output extends Schema.Top,
> {
  readonly name: Name

  readonly description: string

  readonly inputSchema: Input

  readonly execute: (input: Schema.Schema.Type<Input>) => Promise<ResultType<Output>>
}
