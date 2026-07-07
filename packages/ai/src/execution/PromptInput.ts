import type { Message } from '@gyomu/schema/conversation'

/**
 * =========================================
 * Request Types
 * =========================================
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
