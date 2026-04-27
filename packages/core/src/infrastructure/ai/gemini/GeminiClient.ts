import { Config, Effect, Layer, ServiceMap, Stream } from 'effect';
import {
  AiClient,
  ChatContent,
  ChatMessage,
} from '../../../gyomu/ai/client.js';
import { Content, GoogleGenAI, Part, ToolType } from '@google/genai';
import { AiError } from '../../../errors.js';
import { fromPromise } from '@gyomu/shared/effect';
import {
  ConfigLayer,
  ConfigProviderLive,
  ConfigService,
} from '../../config.js';
import { PlatformLayer } from '../../layer.js';
import { unknownError } from '@gyomu/shared';
export class GeminiClient extends ServiceMap.Service<GeminiClient, AiClient>()(
  'GeminiClient',
  {
    make: Effect.gen(function* () {
      const configService = yield* ConfigService;
      const geminiConfigSchema = Config.all({
        apiKey: Config.string(`GEMINI_API_KEY`),
      });
      const config = yield* configService.load(geminiConfigSchema);

      const ai = new GoogleGenAI({ apiKey: config.apiKey });

      return {
        generateText: (input: {
          messages: ChatMessage[];
          temperature?: number;
        }): Effect.Effect<string, AiError> => {
          return fromPromise(
            AiError,
            'Fail to chat',
          )(async () => {
            const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: input.messages.map((m) => ChatMessage2Content(m)),
            });

            if (!response.text) throw new AiError('Fail to chat with Gemni');
            return response.text;
          });
        },
        streamChat: (input: {
          messages: ChatMessage[];
          temperature?: number;
        }): Stream.Stream<string, AiError> => {
          return Stream.unwrap(
            fromPromise(
              AiError,
              'Fail to chat stream',
            )(async () => {
              const response = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: input.messages.map((m) => ChatMessage2Content(m)),
              });

              return Stream.fromAsyncIterable(response, (e) =>
                unknownError(AiError, e, 'Failt to chat stream with Gemini'),
              ).pipe(
                Stream.flatMap((chunk) => {
                  const text = chunk.text;

                  if (!text || text.length === 0) {
                    return Stream.empty;
                  }

                  return Stream.fromIterable(text.split(''));
                }),
              );
            }),
          );
        },
      };
    }),
  },
) {
  static readonly live = Layer.effect(this, this.make).pipe(
    Layer.provide(ConfigProviderLive),
    Layer.provide(PlatformLayer),
  );
}

export const GeminiLayer = Layer.mergeAll(GeminiClient.live).pipe(
  Layer.provideMerge(ConfigLayer),
  Layer.provideMerge(PlatformLayer),
);

const ChatMessage2Content = (message: ChatMessage): Content => {
  return {
    role: message.role == 'user' ? 'user' : 'model',
    parts: message.content.map((c) => ChatContent2Part(c)),
  };
};
const ChatContent2Part = (content: ChatContent): Part => {
  switch (content.type) {
    case 'text':
      return { text: content.text };
    case 'image':
      return { fileData: { fileUri: content.imageUrl } };
    case 'tool_result':
      return {
        toolCall: {
          id: content.toolName,
          toolType: ToolType.TOOL_TYPE_UNSPECIFIED,
        },
      };
  }
};
