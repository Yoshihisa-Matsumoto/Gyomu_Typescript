import { Config, Context, Effect, Layer, Stream } from 'effect'
import { GoogleGenAI, ToolType } from '@google/genai'
import { AiError, isRetryableAiError } from '@gyomu/schema'
import { fromPromise } from '@gyomu/schema/effect'
import { ConfigLayer, ConfigService } from '../../config.js'
import { PlatformLayer } from '../../layer.js'
import type { Content, Part } from '@google/genai'
import type { AiClient, ChatContent, ChatMessage } from '@gyomu/schema/gyomu/ai'

export class GeminiClient extends Context.Service<GeminiClient, AiClient>()('GeminiClient', {
  make: Effect.gen(function* () {
    const configService = yield* ConfigService
    const geminiConfigSchema = Config.all({
      apiKey: Config.string(`GEMINI_API_KEY`),
    })
    const config = yield* configService.load(geminiConfigSchema)

    const ai = new GoogleGenAI({ apiKey: config.apiKey })

    return {
      generateText: (input: {
        messages: Array<ChatMessage>
        temperature?: number
      }): Effect.Effect<string, AiError> => {
        return fromPromise(AiError, (e) => ({
          message: 'AI generate failed',
          operation: 'generate' as const,
          model: 'gemini-3-flash-preview',
          phase: 'request' as const,
          retryable: isRetryableAiError(e),
        }))(async () => {
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: input.messages.map((m) => ChatMessage2Content(m)),
          })

          if (!response.text)
            throw new AiError({
              message: 'Empty AI response',
              operation: 'generate' as const,
              model: 'gemini-3-flash-preview',
              phase: 'response' as const,
              retryable: false,
              cause: undefined,
            })
          return response.text
        })
      },
      streamChat: (input: {
        messages: Array<ChatMessage>
        temperature?: number
      }): Stream.Stream<string, AiError> => {
        return Stream.unwrap(
          fromPromise(AiError, (e) => ({
            message: 'AI stream failed',
            operation: 'generate' as const,
            model: 'gemini-3-flash-preview',
            phase: 'request' as const,
            retryable: isRetryableAiError(e),
          }))(async () => {
            const response = await ai.models.generateContentStream({
              model: 'gemini-3-flash-preview',
              contents: input.messages.map((m) => ChatMessage2Content(m)),
            })

            return Stream.fromAsyncIterable(
              response,
              (e) =>
                new AiError({
                  message: 'AI stream failed',
                  operation: 'stream',
                  model: 'gemini-3-flash-preview',
                  phase: 'request',
                  retryable: isRetryableAiError(e),
                  cause: e,
                }),
            ).pipe(
              Stream.flatMap((chunk) => {
                const text = chunk.text

                if (!text || text.length === 0) {
                  return Stream.empty
                }

                return Stream.fromIterable(text.split(''))
              }),
            )
          }),
        )
      },
    }
  }),
}) {
  static readonly live = Layer.effect(this, this.make)
}

export const GeminiLayer = Layer.mergeAll(GeminiClient.live).pipe(
  Layer.provideMerge(ConfigLayer),
  Layer.provideMerge(PlatformLayer),
)

const ChatMessage2Content = (message: ChatMessage): Content => {
  return {
    role: message.role == 'user' ? 'user' : 'model',
    parts: message.content.map((c) => ChatContent2Part(c)),
  }
}
const ChatContent2Part = (content: ChatContent): Part => {
  switch (content.type) {
    case 'text':
      return { text: content.text }
    case 'image':
      return { fileData: { fileUri: content.imageUrl } }
    case 'tool_result':
      return {
        toolCall: {
          id: content.toolName,
          toolType: ToolType.TOOL_TYPE_UNSPECIFIED,
        },
      }
  }
}
