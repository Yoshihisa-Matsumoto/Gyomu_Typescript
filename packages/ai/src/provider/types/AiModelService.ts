import { Context } from 'effect'
import type { RetryOption } from './RetryObserver.js'
import type { Effect, Schema } from 'effect'
import type { EmbeddingModel, LanguageModel, StreamTextResult } from 'ai'
import type { AiError } from '@gyomu/schema'
import type { Message } from '@gyomu/schema/conversation'
import type { AiTool } from '../../tool/ai-tool.js'
import type { EffectArrayableSchema } from '@gyomu/schema/entity'

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
export type ToolLoopPolicy =
  | {
      readonly type: 'maxSteps'

      readonly maxSteps: number
    }
  | {
      readonly type: 'untilToolCalled'

      readonly toolName: string
    }
  | {
      readonly type: 'untilFinished'
    }

type ToolConfig =
  | {
      readonly tools?: never
      readonly toolLoopPolicy?: never
    }
  | {
      readonly tools: ReadonlyArray<AiTool<any, any, any>>

      readonly toolLoopPolicy: ToolLoopPolicy
    }
type BaseAiParams = {
  readonly model: LanguageModel

  readonly system?: string

  readonly temperature?: number

  readonly abortSignal?: AbortSignal

  readonly headers?: Record<string, string>
}
type TextGenerationParams = BaseAiParams & PromptInput & ToolConfig
export type GenerateTextParams = TextGenerationParams & {
  readonly maxTokens?: number
  readonly retryOption?: RetryOption
}

export type StreamTextParams = TextGenerationParams & {
  readonly maxTokens?: number
  readonly retryOption?: RetryOption
}

export type GenerateObjectParams<TSchema extends EffectArrayableSchema> = BaseAiParams &
  PromptInput &
  ToolConfig & {
    readonly schema: TSchema
    readonly retryOption?: RetryOption
  }

export type EmbedParams<TValue> = {
  readonly model: EmbeddingModel
  readonly value: TValue
  readonly abortSignal?: AbortSignal
  readonly headers?: Record<string, string>
  readonly retryOption?: RetryOption
}

export interface AiObjectResult<T> {
  readonly object: T
  readonly text: string
}
interface AiToolCallPart {
  readonly type: 'tool-call'

  readonly toolName: string

  readonly toolCallId: string

  readonly input: unknown
}
export interface AiTextPart {
  readonly type: 'text'

  readonly text: string
}
interface AiTextDeltaPart {
  readonly type: 'text-delta'
  readonly text: string
}
export type AiMessagePart = AiTextPart | AiToolCallPart
export type AiStreamEvent = AiTextDeltaPart | AiToolCallPart
interface AiAssistantMessage {
  readonly role: 'assistant'

  readonly parts: ReadonlyArray<AiMessagePart>
  /**
   * Concatenated text parts.
   */
  readonly text: string
}
export type AiFinishReason =
  | 'completed'
  | 'max-tokens'
  | 'tool-call'
  | 'content-filtered'
  | 'error'
  | 'cancelled'
  | 'unknown'

interface AiUsage {
  readonly inputTokens: number

  readonly outputTokens: number

  readonly totalTokens?: number | undefined
}
export interface AiGenerateTextResult {
  readonly message: AiAssistantMessage

  readonly usage?: AiUsage

  readonly finishReason?: AiFinishReason
}

/**
 * =========================================
 * Service Definition
 * =========================================
 */

export interface AiModelService {
  readonly generateText: (
    params: GenerateTextParams,
  ) => Effect.Effect<AiGenerateTextResult, AiError>

  readonly streamText: (
    params: StreamTextParams,
  ) => Effect.Effect<StreamTextResult<Record<string, never>, never>, AiError>

  readonly generateObject: <TSchema extends EffectArrayableSchema>(
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

export const AiModelService = Context.Service<AiModelService>('@gyomu/infra/AiService')
