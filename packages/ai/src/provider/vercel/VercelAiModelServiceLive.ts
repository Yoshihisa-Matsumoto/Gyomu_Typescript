import { Layer } from 'effect'
import { Output, embed, generateText, streamText } from 'ai'
import { AiError, withOptional } from '@gyomu/schema'

import { fromPromise, fromSync } from '@gyomu/schema/effect'
import { toJsonSchema } from '@gyomu/schema/entity'
import { AiModelService } from '../types/AiModelService.js'
import { withRetry } from '../withRetry.js'
import { buildToolRuntimeConfig } from './buildToolRuntimeConfig.js'
import { mapGenerateTextResultToAiGenerateTextResult } from './mapResult.js'
import { buildPrompt } from './buildPrompt.js'
import { createAiErrorContext } from './mapAiSdkError.js'
import type { EffectArrayableSchema } from '@gyomu/schema/entity'
import type { Effect, Schema } from 'effect'
import type {
  AiGenerateTextResult,
  EmbedParams,
  GenerateObjectParams,
  GenerateTextParams,
  StreamTextParams,
} from '../types/AiModelService.js'

/**
 * Creates an implementation of the AiModelService using Vercel AI SDK.
 *
 * @returns An instance of AiModelService.
 */

export const makeAiService = (): AiModelService => ({
  generateText: (params: GenerateTextParams): Effect.Effect<AiGenerateTextResult, AiError> => {
    return withRetry(
      fromPromise(AiError, (e) =>
        createAiErrorContext(e, { model: params.model.toString(), operation: 'generate' }),
      )(async () => {
        const result = await generateText({
          model: params.model,
          ...buildPrompt(params),
          ...withOptional({
            system: params.system,

            temperature: params.temperature,
            maxTokens: params.maxTokens,

            abortSignal: params.abortSignal,
            headers: params.headers,
          }),
          ...withOptional(buildToolRuntimeConfig(params)),
        })
        return mapGenerateTextResultToAiGenerateTextResult(result)
      }),
      params.retryOption,
    )
  },

  streamText: (params: StreamTextParams) => {
    return withRetry(
      fromSync(AiError, (e) =>
        createAiErrorContext(e, { model: params.model.toString(), operation: 'stream' }),
      )(() =>
        streamText({
          model: params.model,
          ...buildPrompt(params),
          ...withOptional({
            system: params.system,

            temperature: params.temperature,
            maxTokens: params.maxTokens,

            abortSignal: params.abortSignal,
            headers: params.headers,
          }),
          ...withOptional(buildToolRuntimeConfig(params)),
        }),
      ),
      params.retryOption,
    )
  },

  generateObject: <TSchema extends EffectArrayableSchema>(
    params: GenerateObjectParams<TSchema>,
  ) => {
    return withRetry(
      fromPromise(AiError, (e) =>
        createAiErrorContext(e, { model: params.model.toString(), operation: 'generate' }),
      )(async () => {
        const result = await generateText({
          model: params.model,

          output: Output.object({
            schema: toJsonSchema(params.schema),
          }),

          ...buildPrompt(params),
          ...withOptional({
            system: params.system,

            temperature: params.temperature,

            abortSignal: params.abortSignal,
            headers: params.headers,
          }),

          ...withOptional(buildToolRuntimeConfig(params)),
        })
        return {
          object: result.output as Schema.Schema.Type<TSchema>,
          text: result.text,
        }
      }),
      params.retryOption,
    )
  },

  embed: <TValue>(params: EmbedParams<TValue>) =>
    withRetry(
      fromPromise(AiError, (e) =>
        createAiErrorContext(e, { model: params.model.toString(), operation: 'embedding' }),
      )(async () => {
        const result = await embed({
          model: params.model,
          value: params.value as string,
          ...withOptional({
            abortSignal: params.abortSignal,
            headers: params.headers,
          }),
        })

        return result.embedding
      }),
      params.retryOption,
    ),
})

/**
 * A Layer that provides the Vercel-backed AiModelService implementation.
 */

export const VercelAiModelServiceLive = Layer.succeed(AiModelService, makeAiService())
