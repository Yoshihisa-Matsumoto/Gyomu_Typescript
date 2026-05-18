import { Context } from 'effect'
import type { Effect, Schema } from 'effect'
import type {
  EmbeddingModel,
  GenerateTextResult,
  LanguageModel,
  StreamTextResult,
  ToolSet,
} from 'ai'
import type { AiError } from '@gyomu/schema'
import type { Message } from '@gyomu/schema/conversation'
import type { AiTool } from '../tool/ai-tool.js'
import type { EffectSchema } from '@gyomu/schema/entity'

export type { StreamTextResult } from 'ai'
/**
 * =========================================
 * Request Types
 * =========================================
 */
type PromptInput =
  | {
      readonly prompt: string
      readonly messages?: never
    }
  | {
      readonly messages: ReadonlyArray<Message>
      readonly prompt?: never
    }
export type GenerateTextParams = {
  readonly model: LanguageModel
  readonly system?: string

  readonly temperature?: number
  readonly maxTokens?: number
  readonly abortSignal?: AbortSignal

  readonly tools?: ReadonlyArray<AiTool<string, any, any>>
} & PromptInput

export interface StreamTextParams {
  readonly model: LanguageModel
  readonly system?: string
  readonly prompt?: string
  readonly messages?: ReadonlyArray<Message>

  readonly temperature?: number
  readonly maxTokens?: number
  readonly abortSignal?: AbortSignal
  readonly tools?: ReadonlyArray<AiTool<string, any, any>>
}

export interface GenerateObjectParams<TSchema extends EffectSchema> {
  readonly model: LanguageModel
  readonly schema: TSchema

  readonly system?: string
  readonly prompt?: string
  readonly messages?: ReadonlyArray<Message>

  readonly temperature?: number
  readonly abortSignal?: AbortSignal
  readonly tools?: ReadonlyArray<AiTool<string, any, any>>
}

export interface EmbedParams<TValue> {
  readonly model: EmbeddingModel
  readonly value: TValue
  readonly abortSignal?: AbortSignal
}

export interface AiObjectResult<T> {
  readonly object: T
  readonly text: string
}
/**
 * =========================================
 * Service Definition
 * =========================================
 */

export interface AiService {
  readonly generateText: (
    params: GenerateTextParams,
  ) => Effect.Effect<GenerateTextResult<ToolSet, never>, AiError>

  readonly streamText: (
    params: StreamTextParams,
  ) => Effect.Effect<StreamTextResult<Record<string, never>, never>, AiError>

  readonly generateObject: <TSchema extends EffectSchema>(
    params: GenerateObjectParams<TSchema>,
  ) => Effect.Effect<AiObjectResult<Schema.Schema.Type<TSchema>>, AiError>

  readonly embed: <TValue>(
    params: EmbedParams<TValue>,
  ) => Effect.Effect<ReadonlyArray<number>, AiError>
}

/**
 * =========================================
 * Context Tag
 * =========================================
 */

export const AiService = Context.Service<AiService>('@gyomu/infra/AiService')
