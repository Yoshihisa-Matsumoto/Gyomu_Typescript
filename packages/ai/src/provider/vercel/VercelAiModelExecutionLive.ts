import { Layer, Schema } from 'effect'
import { Output, embed, generateText, streamText } from 'ai'
import { AiError, withOptional } from '@gyomu/schema'

import { fromPromise, fromSync } from '@gyomu/schema/effect'
import { withRetry } from '../withRetry.js'
import { getEmbeddingModel, getLanguageModel } from '../../model/AiModels.js'
import { AiModelExecution } from '../types/AiModelExecuion.js'
import { buildToolRuntimeConfig } from './buildToolRuntimeConfig.js'
import { mapGenerateTextResultToAiGenerateTextResult } from './mapResult.js'
import { buildPrompt } from './buildPrompt.js'
import { createAiErrorContext } from './mapAiSdkError.js'
import type { AiGenerateTextResult } from '../../execution/AiGenerateTextResult.js'
import type {
  EmbedParams,
  GenerateObjectParams,
  GenerateTextParams,
  StreamTextParams,
} from '../types/AiModelExecuion.js'
import type { Effect } from 'effect'
import type { EffectArrayableSchema } from '@gyomu/schema/entity'
import type { AiModelRegistry } from '../../model/AiModels.js'

/**
 * Creates a live implementation of the AiModelExecution service configured for Vercel AI SDK providers.
 *
 * @returns Returns a configured AiModelExecution instance.
 */
export const makeAiModelExecution = (): AiModelExecution => ({
  generateText: (
    registry: AiModelRegistry,
    params: GenerateTextParams,
  ): Effect.Effect<AiGenerateTextResult, AiError> => {
    const model = getLanguageModel(registry, params.key)
    return withRetry(
      fromPromise(AiError, (e) =>
        createAiErrorContext(e, { model: model.toString(), operation: 'generate' }),
      )(async () => {
        const result = await generateText({
          model: model,
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

  streamText: (registry: AiModelRegistry, params: StreamTextParams) => {
    const model = getLanguageModel(registry, params.key)
    return withRetry(
      fromSync(AiError, (e) =>
        createAiErrorContext(e, { model: model.toString(), operation: 'stream' }),
      )(() =>
        streamText({
          model: model,
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
    registry: AiModelRegistry,
    params: GenerateObjectParams<TSchema>,
  ) => {
    const model = getLanguageModel(registry, params.key)
    return withRetry(
      fromPromise(AiError, (e) =>
        createAiErrorContext(e, { model: model.toString(), operation: 'generate' }),
      )(async () => {
        const result = await generateText({
          model: model,

          output: Output.object({
            schema: Schema.toStandardSchemaV1(Schema.toStandardJSONSchemaV1(params.schema)),
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

  embed: <TValue>(registry: AiModelRegistry, params: EmbedParams<TValue>) => {
    const model = getEmbeddingModel(registry)
    return withRetry(
      fromPromise(AiError, (e) =>
        createAiErrorContext(e, { model: model.toString(), operation: 'embedding' }),
      )(async () => {
        const result = await embed({
          model: model,
          value: params.value as string,
          ...withOptional({
            abortSignal: params.abortSignal,
            headers: params.headers,
          }),
        })

        return result.embedding
      }),
      params.retryOption,
    )
  },
})

/**
 * A Layer containing the Vercel AI SDK implementation of the AiModelExecution service.
 */
export const VercelAiModelExecutionLive = Layer.succeed(AiModelExecution, makeAiModelExecution())
