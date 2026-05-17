import { Context } from 'effect'
import type { Effect, Schema } from 'effect'
import type { EmbeddingModel, GenerateTextResult, LanguageModel, StreamTextResult } from 'ai'
import type { AiError } from '@gyomu/schema'
import type { Message } from '@gyomu/schema/conversation'

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
} & PromptInput

export interface StreamTextParams {
  readonly model: LanguageModel
  readonly system?: string
  readonly prompt?: string
  readonly messages?: ReadonlyArray<Message>

  readonly temperature?: number
  readonly maxTokens?: number
  readonly abortSignal?: AbortSignal
}
export type EffectSchema = Parameters<typeof Schema.toStandardSchemaV1>[0]
export interface GenerateObjectParams<TSchema extends EffectSchema> {
  readonly model: LanguageModel
  readonly schema: TSchema

  readonly system?: string
  readonly prompt?: string
  readonly messages?: ReadonlyArray<Message>

  readonly temperature?: number
  readonly abortSignal?: AbortSignal
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
  ) => Effect.Effect<GenerateTextResult<Record<string, never>, never>, AiError>

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
