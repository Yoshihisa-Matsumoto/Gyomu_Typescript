import { Layer, Schema } from 'effect'
import { Output, embed, generateText, streamText } from 'ai'
import { AiError, withOptional } from '@gyomu/schema'

import { fromPromise, fromSync } from '@gyomu/schema/effect'
import { AiModelService } from '../types/AiModelService.js'
import { buildToolRuntimeConfig } from './buildToolRuntimeConfig.js'
import { mapGenerateTextResultToAiGenerateTextResult } from './mapResult.js'
import { buildPrompt } from './buildPrompt.js'
import type { Effect } from 'effect'
import type {
  AiGenerateTextResult,
  EmbedParams,
  GenerateObjectParams,
  GenerateTextParams,
  StreamTextParams,
} from '../types/AiModelService.js'
import type { EffectSchema } from '@gyomu/schema/entity'

/**
 * =========================================
 * Service Implementation
 * =========================================
 */

export const makeAiService = (): AiModelService => ({
  generateText: (params: GenerateTextParams): Effect.Effect<AiGenerateTextResult, AiError> => {
    return fromPromise(AiError, () => ({
      message: 'fail to generate text',
      model: params.model.toString(),
      operation: 'generate' as const,
      phase: 'request' as const,
      retryable: false,
    }))(async () => {
      console.log('generateText')
      const result = await generateText({
        model: params.model,
        ...buildPrompt(params),
        ...withOptional({
          system: params.system,

          temperature: params.temperature,
          maxTokens: params.maxTokens,

          abortSignal: params.abortSignal,
        }),
        ...withOptional(buildToolRuntimeConfig(params)),
      })
      return mapGenerateTextResultToAiGenerateTextResult(result)
    })
  },

  streamText: (params: StreamTextParams) => {
    return fromSync(AiError, () => ({
      message: 'fail to generate stream',
      model: params.model.toString(),
      operation: 'stream' as const,
      phase: 'request' as const,
      retryable: false,
    }))(() =>
      streamText({
        model: params.model,
        ...buildPrompt(params),
        ...withOptional({
          system: params.system,

          temperature: params.temperature,
          maxTokens: params.maxTokens,

          abortSignal: params.abortSignal,
        }),
        ...withOptional(buildToolRuntimeConfig(params)),
      }),
    )
  },

  generateObject: <TSchema extends EffectSchema>(params: GenerateObjectParams<TSchema>) => {
    return fromPromise(AiError, () => ({
      message: 'fail to generate structured object',
      model: params.model.toString(),
      operation: 'generate' as const,
      phase: 'decode' as const,
      retryable: false,
    }))(async () => {
      const result = await generateText({
        model: params.model,

        output: Output.object({
          schema: Schema.toStandardSchemaV1(Schema.toStandardJSONSchemaV1(params.schema)),
        }),

        ...buildPrompt(params),
        ...withOptional({
          system: params.system,

          temperature: params.temperature,

          abortSignal: params.abortSignal,
        }),
        ...withOptional(buildToolRuntimeConfig(params)),
      })
      return {
        object: result.output as Schema.Schema.Type<TSchema>,
        text: result.text,
      }
    })
  },

  embed: <TValue>(params: EmbedParams<TValue>) =>
    fromPromise(AiError, () => ({
      message: 'fail to generate structured object',
      model: params.model.toString(),
      operation: 'embedding' as const,
      phase: 'request' as const,
      retryable: false,
    }))(async () => {
      const result = await embed({
        model: params.model,
        value: params.value as string,
        ...withOptional({
          abortSignal: params.abortSignal,
        }),
      })

      return result.embedding
    }),
})

/**
 * =========================================
 * Layer
 * =========================================
 */

export const VercelAiModelServiceLive = Layer.succeed(AiModelService, makeAiService())
