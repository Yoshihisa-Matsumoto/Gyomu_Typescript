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

/**
 * Parameters for generating text using an AI model.
 */
export type GenerateTextParams = Request<
  ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly maxTokens?: number
    }
>

/**
 * Parameters for streaming text from an AI model.
 */
export type StreamTextParams = Request<
  ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly maxTokens?: number
    }
>

/**
 * Parameters for generating a structured object from an AI model based on a schema.
 */
export type GenerateObjectParams<TSchema extends EffectArrayableSchema> = Request<
  ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly schema: TSchema
    }
>

/**
 * Parameters for embedding a value using an AI model.
 */
export type EmbedParams<TValue> = Request<
  object,
  {
    value: TValue
  }
>

/**
 * Defines the service interface for executing AI model operations, including text generation, streaming, structured object generation, and embedding.
 */

export interface AiModelExecution {
  /**
   * Generates text content using the provided AI model registry and configuration parameters.
   *
   * @returns An Effect representing the generated text result or an AiError.
   */
  readonly generateText: (
    registry: AiModelRegistry,
    params: GenerateTextParams,
  ) => Effect.Effect<AiGenerateTextResult, AiError>

  /**
   * Streams text content using the provided AI model registry and configuration parameters.
   *
   * @returns An Effect representing the stream text result or an AiError.
   */
  readonly streamText: (
    registry: AiModelRegistry,
    params: StreamTextParams,
  ) => Effect.Effect<StreamTextResult<Record<string, never>, never>, AiError>

  /**
   * Generates a structured object matching the specified schema using the provided AI model registry and configuration.
   *
   * @returns An Effect representing the generated object result or an AiError.
   */
  readonly generateObject: <TSchema extends EffectArrayableSchema>(
    registry: AiModelRegistry,
    params: GenerateObjectParams<TSchema>,
  ) => Effect.Effect<AiObjectResult<Schema.Schema.Type<TSchema>>, AiError>

  /**
   * Generates numerical embeddings for the provided input value using the specified AI model registry.
   *
   * @returns An Effect representing the array of floating point embeddings or an AiError.
   */
  readonly embed: <TValue>(
    registry: AiModelRegistry,
    params: EmbedParams<TValue>,
  ) => Effect.Effect<ReadonlyArray<number>, AiError>
}

/**
 * The Context service tag for accessing the AiModelExecution service.
 */

export const AiModelExecution = Context.Service<AiModelExecution>('@gyomu/ai/AiModelExecution')
