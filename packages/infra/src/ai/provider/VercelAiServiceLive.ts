import { Layer, Schema } from 'effect'
import { Output, embed, generateText, streamText } from 'ai'
import { AiError, withOptional } from '@gyomu/schema'

import { fromPromise, fromSync } from '@gyomu/schema/effect'
import { AiService } from '../service/AiService.js'
import type { ModelMessage } from 'ai'
import type {
  EffectSchema,
  EmbedParams,
  GenerateObjectParams,
  GenerateTextParams,
  StreamTextParams,
} from '../service/AiService.js'

/**
 * =========================================
 * Error Normalize
 * =========================================
 */

const buildPrompt = (params: {
  readonly prompt?: string
  readonly messages?: ReadonlyArray<ModelMessage>
}): { readonly prompt: string } | { readonly messages: Array<ModelMessage> } => {
  if (params.messages) {
    return {
      messages: [...params.messages],
    }
  }

  if (params.prompt) {
    return {
      prompt: params.prompt,
    }
  }

  throw new AiError({
    message: 'prompt or messages is required',

    operation: 'generate',
    model: 'unknown',
    phase: 'request',

    retryable: false,
    cause: undefined,
  })
}

/**
 * =========================================
 * Service Implementation
 * =========================================
 */

const makeAiService = (): AiService => ({
  generateText: (params: GenerateTextParams) =>
    fromPromise(AiError, () => ({
      message: 'fail to generate text',
      model: params.model.toString(),
      operation: 'generate' as const,
      phase: 'request' as const,
      retryable: false,
    }))(async () => {
      console.log('generateText')
      return generateText({
        model: params.model,
        ...buildPrompt(params),
        ...withOptional({
          system: params.system,

          temperature: params.temperature,
          maxTokens: params.maxTokens,

          abortSignal: params.abortSignal,
        }),
      })
    }),

  streamText: (params: StreamTextParams) =>
    fromSync(AiError, () => ({
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
      }),
    ),

  generateObject: <TSchema extends EffectSchema>(params: GenerateObjectParams<TSchema>) =>
    fromPromise(AiError, () => ({
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
      })
      return {
        object: result.output as Schema.Schema.Type<TSchema>,
        text: result.text,
      }
    }),

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

export const AiServiceLive = Layer.succeed(AiService, makeAiService())
