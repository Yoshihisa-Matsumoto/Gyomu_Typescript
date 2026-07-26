import { Context } from 'effect'
import type { AiError, RetryOption } from '@gyomu/schema'
import type { Effect, Schema } from 'effect'
import type { EmbeddingModel, LanguageModel, StreamTextResult } from 'ai'
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

/**
 * Defines the policy for controlling the loop of tool calls during AI generation.
 */
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

/**
 * Defines the configuration parameters for text generation, including optional token limits and retry behavior.
 */
export type GenerateTextParams = TextGenerationParams & {
  readonly maxTokens?: number
  readonly retryOption?: RetryOption
}

/**
 * Defines the configuration parameters for streaming text generation, including optional token limits and retry behavior.
 */
export type StreamTextParams = TextGenerationParams & {
  readonly maxTokens?: number
  readonly retryOption?: RetryOption
}

/**
 * Defines the configuration parameters for generating structured objects based on a schema, supporting retry logic and prompt inputs.
 */
export type GenerateObjectParams<TSchema extends EffectArrayableSchema> = BaseAiParams &
  PromptInput &
  ToolConfig & {
    readonly schema: TSchema
    readonly retryOption?: RetryOption
  }

/**
 * Defines the parameters required for embedding values, including the embedding model, input value, and operational options.
 */
export type EmbedParams<TValue> = {
  readonly model: EmbeddingModel
  readonly value: TValue
  readonly abortSignal?: AbortSignal
  readonly headers?: Record<string, string>
  readonly retryOption?: RetryOption
}

/**
 * Represents the result of an object generation request, containing the parsed object and the raw text response.
 */
export interface AiObjectResult<T> {
  /**
   * The generated object parsed from the model response.
   */
  readonly object: T

  /**
   * The raw string representation of the generated object.
   */
  readonly text: string
}
interface AiToolCallPart {
  readonly type: 'tool-call'

  readonly toolName: string

  readonly toolCallId: string

  readonly input: unknown
}

/**
 * Represents a segment of text content within an AI message.
 */
export interface AiTextPart {
  /**
   * The type identifier for the part, set to 'text'.
   */
  readonly type: 'text'

  /**
   * The text content of this part.
   */
  readonly text: string
}
interface AiTextDeltaPart {
  readonly type: 'text-delta'
  readonly text: string
}

/**
 * Union type representing the components of an AI message, either text or tool calls.
 */
export type AiMessagePart = AiTextPart | AiToolCallPart

/**
 * Union type representing the types of events emitted during an AI streaming operation.
 */
export type AiStreamEvent = AiTextDeltaPart | AiToolCallPart
interface AiAssistantMessage {
  readonly role: 'assistant'

  readonly parts: ReadonlyArray<AiMessagePart>
  /**
   * Concatenated text parts.
   */
  readonly text: string
}

/**
 * Enumerates the possible reasons why an AI generation process finished.
 */
export type AiFinishReason =
  'completed' | 'max-tokens' | 'tool-call' | 'content-filtered' | 'error' | 'cancelled' | 'unknown'

interface AiUsage {
  readonly inputTokens: number

  readonly outputTokens: number

  readonly totalTokens?: number | undefined
}

/**
 * Represents the result of a text generation request, containing the assistant's message, usage data, and the reason for completion.
 */
export interface AiGenerateTextResult {
  /**
   * The message returned by the assistant.
   */
  readonly message: AiAssistantMessage

  /**
   * Optional usage statistics for the generation request.
   */
  readonly usage?: AiUsage

  /**
   * Optional reason indicating why the generation process stopped.
   */
  readonly finishReason?: AiFinishReason
}

/**
 * Interface for an AI model service that provides text generation, object generation, and embedding capabilities.
 */

export interface AiModelService {
  /**
   * Generates text based on the provided parameters.
   *
   * @returns An effect that yields the generated text result or an AiError on failure.
   */
  readonly generateText: (
    params: GenerateTextParams,
  ) => Effect.Effect<AiGenerateTextResult, AiError>

  /**
   * Streams text generation results.
   *
   * @returns An effect that yields the stream result or an AiError on failure.
   */
  readonly streamText: (
    params: StreamTextParams,
  ) => Effect.Effect<StreamTextResult<Record<string, never>, never>, AiError>

  /**
   * Generates a structured object based on the provided schema.
   *
   * @returns An effect that yields the generated object result or an AiError on failure.
   */
  readonly generateObject: <TSchema extends EffectArrayableSchema>(
    params: GenerateObjectParams<TSchema>,
  ) => Effect.Effect<AiObjectResult<Schema.Schema.Type<TSchema>>, AiError>

  /**
   * Generates embeddings for the provided value.
   *
   * @returns An effect that yields the embedding vector or an AiError on failure.
   */
  readonly embed: <TValue>(
    params: EmbedParams<TValue>,
  ) => Effect.Effect<ReadonlyArray<number>, AiError>
}

/**
 * Context service tag for injecting the AiModelService.
 */

export const AiModelService = Context.Service<AiModelService>('@gyomu/ai/AiService')
