import type { UIMessage } from '@ai-sdk/react'
import type { Message, MessageRole } from '@gyomu/schema/conversation'
import type { GyomuChatStatus } from './useGyomuChat.js'

/**
 * Extracts the plain text content from a UI message by concatenating all text parts.
 *
 * @param message The message object containing structured parts.
 *
 * @returns The concatenated plain text string.
 */
export const getPlainTextFromUiMessage = (message: UIMessage): string => {
  return message.parts
    .flatMap((part) => {
      switch (part.type) {
        case 'text':
          return [part.text]

        default:
          return []
      }
    })
    .join('')
}

/**
 * Maps a UI message to a Gyomu message format.
 *
 * @param message The source UI message to convert.
 *
 * @returns A converted message object compliant with Gyomu Message structure.
 */
export const mapAiSdkMessageToGyomuMessage = (message: UIMessage): Message => ({
  id: message.id,
  role: message.role as MessageRole,
  content: getPlainTextFromUiMessage(message),
})

/**
 * Maps a raw status string to a standardized Gyomu chat status.
 *
 * @param status The raw status string.
 *
 * @returns The corresponding GyomuChatStatus, defaulting to 'idle'.
 */
export const mapStatus = (status: string): GyomuChatStatus => {
  switch (status) {
    case 'submitted':
      return 'submitting'

    case 'streaming':
      return 'streaming'

    case 'error':
      return 'error'

    default:
      return 'idle'
  }
}
