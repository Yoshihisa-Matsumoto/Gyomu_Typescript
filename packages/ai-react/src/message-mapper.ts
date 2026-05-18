import type { UIMessage } from '@ai-sdk/react'
import type { Message, MessageRole } from '@gyomu/schema/conversation'
import type { GyomuChatStatus } from './useGyomuChat.js'

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
export const mapAiSdkMessageToGyomuMessage = (message: UIMessage): Message => ({
  id: message.id,
  role: message.role as MessageRole,
  content: getPlainTextFromUiMessage(message),
})
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
