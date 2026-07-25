import { createGoogleGenerativeAI } from '@ai-sdk/google'
// import { createOpenAI } from '@ai-sdk/openai'
// import { createAnthropic } from '@ai-sdk/anthropic'

import { Context, Effect, Layer } from 'effect'
import type { EmbeddingModel, LanguageModel } from 'ai'
import type { AiProviderError } from '../error/AiProviderError.js'

/**
 * =========================================
 * Provider Clients
 * =========================================
 */

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

// const openai = createOpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// })

// const anthropic = createAnthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY!,
// })

/**
 * Registry of available AI models, including various language models and an embedding model.
 */

export interface AiModelRegistry {
  /**
   * A fast language model for low-latency tasks.
   */
  readonly fast: LanguageModel

  /**
   * A high-quality general-purpose language model.
   */
  readonly smart: LanguageModel

  /**
   * A language model optimized for complex reasoning tasks.
   */
  readonly reasoning: LanguageModel

  /**
   * A multimodal language model capable of processing visual input.
   */
  readonly vision: LanguageModel

  /**
   * An embedding model for vectorizing text.
   */
  readonly embedding: EmbeddingModel
}

/**
 * A union type representing keys in AiModelRegistry that map to LanguageModel.
 */
export type AiModelRegistryKey = {
  [K in keyof AiModelRegistry]: AiModelRegistry[K] extends LanguageModel ? K : never
}[keyof AiModelRegistry]

/**
 * Retrieves a specific language model from the registry by its key.
 *
 * @param registry The model registry instance.
 *
 * @param key The key of the desired language model.
 *
 * @returns The language model.
 */
export const getLanguageModel = (registry: AiModelRegistry, key: AiModelRegistryKey) =>
  registry[key]

/**
 * Retrieves the embedding model from the registry.
 *
 * @param registry The model registry instance.
 *
 * @returns The embedding model.
 */
export const getEmbeddingModel = (registry: AiModelRegistry) => registry.embedding

/**
 * A default implementation of AiModelRegistry providing pre-configured Google models.
 */

export const AI_MODELS: AiModelRegistry = {
  /**
   * Fast / Cheap
   */
  fast: google('gemini-3.1-flash-lite'),

  /**
   * High quality general model
   */
  smart: google('gemini-2.5-pro'),

  /**
   * Strong reasoning
   */
  reasoning: google('gemini-2.5-pro'),

  /**
   * Vision / multimodal
   */
  vision: google('gemini-2.5-pro'),

  /**
   * Embedding
   */
  embedding: google.embedding('gemini-embedding-001'),
}

/**
 * The Effect Context Service definition for the AI model registry.
 */
export class AiModels extends Context.Service<AiModels, AiModelRegistry>()('AiModels') {}

/**
 * Creates an Effect that resolves to the Google-configured AI model registry.
 *
 * @returns An Effect yielding an AiModelRegistry or an AiProviderError on failure.
 */
export const makeGoogleModelRegistry = (): Effect.Effect<AiModelRegistry, AiProviderError> => {
  return Effect.succeed(AI_MODELS)
}

/**
 * A Layer that provides the configured Google AI models to the application context.
 */
export const MyGoogleModelsLayer = Layer.effect(AiModels, makeGoogleModelRegistry())
