import { Effect, Stream } from 'effect';
import { AIError } from '../../error/AiError.js';
// export type ChatStreamEvent =
//   | { type: 'delta'; content: string } // 部分テキスト
//   | { type: 'done' } // 完了
//   | { type: 'error'; error: AiError }; // エラー

type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessage = {
  role: ChatRole;
  content: ChatContent[];
  name?: string; // tool名やassistant名（任意）
};

export type ChatContent =
  | { type: 'text'; text: string }
  | { type: 'image'; imageUrl: string }
  | { type: 'tool_result'; toolName: string; result: unknown };

export interface AiClient {
  generateText: (input: {
    messages: ChatMessage[];
    temperature?: number;
  }) => Effect.Effect<string, AIError>;
  streamChat: (input: {
    messages: ChatMessage[];
    temperature?: number;
  }) => Stream.Stream<string, AIError>;
}
