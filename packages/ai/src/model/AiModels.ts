import { createGoogleGenerativeAI } from '@ai-sdk/google'
// import { createOpenAI } from '@ai-sdk/openai'
// import { createAnthropic } from '@ai-sdk/anthropic'

import { Context, Effect, Layer } from 'effect'
import type { EmbeddingModel, LanguageModel } from 'ai'
import type { AiProviderError } from './AiProviderError.js'

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
 * =========================================
 * Model Registry
 * =========================================
 */

export interface AiModelRegistry {
  readonly fast: LanguageModel
  readonly smart: LanguageModel
  readonly reasoning: LanguageModel
  readonly vision: LanguageModel

  readonly embedding: EmbeddingModel
}

/**
 * =========================================
 * Models
 * =========================================
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

export class AiModels extends Context.Service<AiModels, AiModelRegistry>()('AiModels') {}
export const makeGoogleModelRegistry = (): Effect.Effect<AiModelRegistry, AiProviderError> => {
  return Effect.succeed(AI_MODELS)
}
export const MyGoogleModelsLayer = Layer.effect(AiModels, makeGoogleModelRegistry())
