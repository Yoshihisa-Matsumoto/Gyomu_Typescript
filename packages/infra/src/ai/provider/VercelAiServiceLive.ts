import { Layer, Schema } from 'effect'
import { Output, embed, generateText, streamText } from 'ai'
import { AiError, withOptional } from '@gyomu/schema'

import { fromPromise, fromSync } from '@gyomu/schema/effect'
import { AiService } from '../service/AiService.js'
import { toVercelTool } from '../tool/adapter/to-vercel-tool.js'
import type { ModelMessage } from 'ai'
import type {
  EmbedParams,
  GenerateObjectParams,
  GenerateTextParams,
  StreamTextParams,
} from '../service/AiService.js'
import type { Message } from '@gyomu/schema/conversation'
import type { EffectSchema } from '@gyomu/schema/entity'

/**
 * =========================================
 * Error Normalize
 * =========================================
 */

const buildPrompt = (params: {
  readonly prompt?: string
  readonly messages?: ReadonlyArray<Message>
}): { readonly prompt: string } | { readonly messages: Array<ModelMessage> } => {
  if (params.messages) {
    return {
      messages: params.messages.map(
        (m) => ({ role: m.role, content: m.content }) satisfies ModelMessage,
      ),
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

export const makeAiService = (): AiService => ({
  generateText: (params: GenerateTextParams) => {
    const tools = params.tools
      ? Object.fromEntries(params.tools.map((toolDef) => [toolDef.name, toVercelTool(toolDef)]))
      : undefined

    return fromPromise(AiError, () => ({
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
          tools,
        }),
      })
    })
  },

  streamText: (params: StreamTextParams) => {
    const tools = params.tools
      ? Object.fromEntries(params.tools.map((toolDef) => [toolDef.name, toVercelTool(toolDef)]))
      : undefined
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
          tools,
        }),
      }),
    )
  },

  generateObject: <TSchema extends EffectSchema>(params: GenerateObjectParams<TSchema>) => {
    const tools = params.tools
      ? Object.fromEntries(params.tools.map((toolDef) => [toolDef.name, toVercelTool(toolDef)]))
      : undefined
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
          tools,
        }),
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

export const AiServiceLive = Layer.succeed(AiService, makeAiService())
