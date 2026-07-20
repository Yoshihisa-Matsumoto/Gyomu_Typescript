import type { Effect, Stream } from 'effect'
import type { AiError } from '../../error/AiError.js'
// export type ChatStreamEvent =
//   | { type: 'delta'; content: string } // 部分テキスト
//   | { type: 'done' } // 完了
//   | { type: 'error'; error: AiError }; // エラー

type ChatRole = 'system' | 'user' | 'assistant' | 'tool'

/**
 * Defines a message in a chat conversation, including the sender role, content, and optional identifier.
 *
 * @param role The role of the message sender.
 *
 * @param content The list of contents included in the message.
 *
 * @param name Optional name for the tool or assistant.
 */
export type ChatMessage = {
  /**
   * The role of the message sender.
   */
  role: ChatRole

  /**
   * The message content as an array of structured elements.
   */
  content: Array<ChatContent>

  /**
   * An optional identifier for the tool or assistant.
   */
  name?: string // tool名やassistant名（任意）
}

/**
 * Defines the possible types of content within a chat message, such as text, images, or tool results.
 */
export type ChatContent =
  | { type: 'text'; text: string }
  | { type: 'image'; imageUrl: string }
  | { type: 'tool_result'; toolName: string; result: unknown }

/**
 * Represents a client for interacting with AI models, supporting text generation and streaming responses.
 */
export interface AiClient {
  /**
   * Generates text based on the provided conversation messages and optional configuration.
   *
   * @param input Input containing the message sequence and optional temperature settings.
   *
   * @returns An effect that resolves to the generated text, or an AiError if the operation fails.
   */
  generateText: (input: {
    messages: Array<ChatMessage>
    temperature?: number
  }) => Effect.Effect<string, AiError>

  /**
   * Streams chat responses based on the provided conversation messages and optional configuration.
   *
   * @param input Input containing the message sequence and optional temperature settings.
   *
   * @returns A stream of generated text tokens, or an AiError if the stream fails.
   */
  streamChat: (input: {
    messages: Array<ChatMessage>
    temperature?: number
  }) => Stream.Stream<string, AiError>
}
