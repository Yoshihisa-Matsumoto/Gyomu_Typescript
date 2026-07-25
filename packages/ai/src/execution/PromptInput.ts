import type { Message } from '@gyomu/schema/conversation'

/**
 * Defines a union of allowed prompt input formats, accepting either a single string prompt or an array of messages.
 */

export type PromptInput =
  | {
      readonly prompt: string
      readonly messages?: never
    }
  | {
      readonly messages: ReadonlyArray<Message>
      readonly prompt?: never
    }
