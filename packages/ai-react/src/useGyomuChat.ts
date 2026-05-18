import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useMemo } from 'react'
import { withOptional } from '@gyomu/schema'
import type { PublicError } from '@gyomu/schema'
import type { Message, MessageRole, SendMessageInput } from '@gyomu/schema/conversation'
import type { UIMessage } from 'ai'
import type { UiErrorHandling } from '@gyomu/ui-core'

export type { UIMessage } from 'ai'

export interface UseGyomuChatOptions {
  readonly endpoint?: string

  readonly conversationId?: string

  readonly initialMessages?: ReadonlyArray<Message>

  readonly metadata?: Record<string, unknown>

  readonly onError?: (error: PublicError) => void

  readonly onFinish?: (message: Message) => Promise<void>

  readonly mapUiPolicy: (error: PublicError) => UiErrorHandling

  readonly showUiError?: (policy: UiErrorHandling) => void
}
export type GyomuChatStatus = 'idle' | 'submitting' | 'streaming' | 'error'
export interface GyomuChatHandle {
  readonly messages: ReadonlyArray<Message>

  readonly status: GyomuChatStatus

  readonly error?: PublicError

  readonly sendMessage: (input: SendMessageInput) => Promise<void>

  readonly pushUiError: (error: PublicError) => void

  readonly stop: () => void
}
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
const mapAiSdkMessageToGyomuMessage = (message: UIMessage): Message => ({
  id: message.id,
  role: message.role as MessageRole,
  content: getPlainTextFromUiMessage(message),
})
const mapStatus = (status: string): GyomuChatStatus => {
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

export class PublicErrorException extends Error {
  constructor(readonly publicError: PublicError) {
    super(publicError.message)
  }
}
export const useGyomuChat = (options: UseGyomuChatOptions): GyomuChatHandle => {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: options.endpoint ?? 'api/chat',
    }),

    ...withOptional({
      onError: options.onError,

      onFinish: options.onFinish
        ? async ({ message }: { message: UIMessage }) => {
            await options.onFinish?.(mapAiSdkMessageToGyomuMessage(message))
          }
        : undefined,
    }),
  })

  const messages = useMemo(() => chat.messages.map(mapAiSdkMessageToGyomuMessage), [chat.messages])

  const pushUiError = (error: PublicError) => {
    const policy = options.mapUiPolicy(error)
    options.showUiError?.(policy)
  }

  return {
    messages,

    status: mapStatus(chat.status),

    ...withOptional({
      error: chat.error,
    }),

    sendMessage: async (input) => {
      await chat.sendMessage({
        text: input.text,
      })
    },

    stop: chat.stop,
    pushUiError,
  }
}
