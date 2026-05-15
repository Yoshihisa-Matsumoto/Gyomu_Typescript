import type { Effect, Stream } from 'effect'
import type { AiError } from '../../error/AiError.js'
// export type ChatStreamEvent =
//   | { type: 'delta'; content: string } // 部分テキスト
//   | { type: 'done' } // 完了
//   | { type: 'error'; error: AiError }; // エラー

type ChatRole = 'system' | 'user' | 'assistant' | 'tool'

export type ChatMessage = {
  role: ChatRole
  content: Array<ChatContent>
  name?: string // tool名やassistant名（任意）
}

export type ChatContent =
  | { type: 'text'; text: string }
  | { type: 'image'; imageUrl: string }
  | { type: 'tool_result'; toolName: string; result: unknown }

export interface AiClient {
  generateText: (input: {
    messages: Array<ChatMessage>
    temperature?: number
  }) => Effect.Effect<string, AiError>
  streamChat: (input: {
    messages: Array<ChatMessage>
    temperature?: number
  }) => Stream.Stream<string, AiError>
}
