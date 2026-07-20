import { Context } from 'effect'
import type { AiObjectResult } from '../../execution/AiObjectResult.js'
import type { AiGenerateTextResult } from '../../execution/AiGenerateTextResult.js'
import type { Request } from '../../execution/Request.js'
import type { ModelSelection } from '../../execution/RouteSelection.js'
import type { ToolConfig } from '../../execution/ToolConfig.js'
import type { PromptInput } from '../../execution/PromptInput.js'
import type { AiModelRegistry } from '../../model/AiModels.js'
import type { Effect, Schema } from 'effect'
import type { StreamTextResult } from 'ai'
import type { AiError } from '@gyomu/schema'
import type { EffectArrayableSchema } from '@gyomu/schema/entity'

export type GenerateTextParams = Request<
  ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly maxTokens?: number
    }
>

export type StreamTextParams = Request<
  ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly maxTokens?: number
    }
>

export type GenerateObjectParams<TSchema extends EffectArrayableSchema> = Request<
  ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly schema: TSchema
    }
>

export type EmbedParams<TValue> = Request<
  object,
  {
    value: TValue
  }
>

/**
 * =========================================
 * Service Definition
 * =========================================
 */

export interface AiModelExecution {
  readonly generateText: (
    registry: AiModelRegistry,
    params: GenerateTextParams,
  ) => Effect.Effect<AiGenerateTextResult, AiError>

  readonly streamText: (
    registry: AiModelRegistry,
    params: StreamTextParams,
  ) => Effect.Effect<StreamTextResult<Record<string, never>, never>, AiError>

  readonly generateObject: <TSchema extends EffectArrayableSchema>(
    registry: AiModelRegistry,
    params: GenerateObjectParams<TSchema>,
  ) => Effect.Effect<AiObjectResult<Schema.Schema.Type<TSchema>>, AiError>

  readonly embed: <TValue>(
    registry: AiModelRegistry,
    params: EmbedParams<TValue>,
  ) => Effect.Effect<ReadonlyArray<number>, AiError>
}

/**
 * =========================================
 * Context Tag
 * =========================================
 */

export const AiModelExecution = Context.Service<AiModelExecution>('@gyomu/ai/AiModelExecution')
