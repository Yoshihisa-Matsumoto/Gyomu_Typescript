export type { StreamTextResult } from 'ai'

interface AiToolCallPart {
  readonly type: 'tool-call'

  readonly toolName: string

  readonly toolCallId: string

  readonly input: unknown
}
export interface AiTextPart {
  readonly type: 'text'

  readonly text: string
}
interface AiTextDeltaPart {
  readonly type: 'text-delta'
  readonly text: string
}
export type AiMessagePart = AiTextPart | AiToolCallPart
export type AiStreamEvent = AiTextDeltaPart | AiToolCallPart
export interface AiAssistantMessage {
  readonly role: 'assistant'

  readonly parts: ReadonlyArray<AiMessagePart>
  /**
   * Concatenated text parts.
   */
  readonly text: string
}
export type AiFinishReason =
  'completed' | 'max-tokens' | 'tool-call' | 'content-filtered' | 'error' | 'cancelled' | 'unknown'

export interface AiUsage {
  readonly inputTokens: number

  readonly outputTokens: number

  readonly totalTokens?: number | undefined
}
