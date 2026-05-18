import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useMemo } from 'react'
import { withOptional } from '@gyomu/schema'
import { PublicErrorException } from './public-error.exception.js'
import { createGyomuFetch } from './create-gyomu-fetch.js'
import { mapAiSdkMessageToGyomuMessage, mapStatus } from './message-mapper.js'
import type { PublicError } from '@gyomu/schema'
import type { Message, SendMessageInput } from '@gyomu/schema/conversation'
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

export const useGyomuChat = (options: UseGyomuChatOptions): GyomuChatHandle => {
  const pushUiError = (error: PublicError) => {
    const policy = options.mapUiPolicy(error)
    options.showUiError?.(policy)
  }
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: options.endpoint ?? 'api/chat',
        fetch: createGyomuFetch(),
      }),
    [options.endpoint],
  )

  const chat = useChat({
    transport,
    onError: (error) => {
      if (error instanceof PublicErrorException) {
        const publicError = error.publicError

        pushUiError(publicError)

        options.onError?.(publicError)
      }
    },
    ...withOptional({
      onFinish: options.onFinish
        ? async ({ message }: { message: UIMessage }) => {
            await options.onFinish?.(mapAiSdkMessageToGyomuMessage(message))
          }
        : undefined,
    }),
  })

  const messages = useMemo(() => chat.messages.map(mapAiSdkMessageToGyomuMessage), [chat.messages])

  const publicError =
    chat.error instanceof PublicErrorException ? chat.error.publicError : undefined

  return {
    messages,

    status: mapStatus(chat.status),

    ...withOptional({
      error: publicError,
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
