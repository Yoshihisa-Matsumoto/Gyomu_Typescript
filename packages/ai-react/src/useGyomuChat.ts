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

/**
 * Configuration options for the useGyomuChat hook.
 */
export interface UseGyomuChatOptions {
  /**
   * The API endpoint URL for the chat service.
   */
  readonly endpoint?: string

  /**
   * An optional identifier for the conversation session.
   */
  readonly conversationId?: string

  /**
   * An optional list of messages to populate the chat initially.
   */
  readonly initialMessages?: ReadonlyArray<Message>

  /**
   * Optional custom metadata associated with the chat session.
   */
  readonly metadata?: Record<string, unknown>

  /**
   * Optional callback invoked when a chat error occurs.
   */
  readonly onError?: (error: PublicError) => void

  /**
   * Optional callback invoked when a chat response stream completes.
   */
  readonly onFinish?: (message: Message) => Promise<void>

  /**
   * Maps a technical error to a specific UI error handling policy.
   */
  readonly mapUiPolicy: (error: PublicError) => UiErrorHandling

  /**
   * Optional callback to trigger UI error presentation based on the calculated policy.
   */
  readonly showUiError?: (policy: UiErrorHandling) => void
}

/**
 * Represents the current connection or processing status of the chat.
 */
export type GyomuChatStatus = 'idle' | 'submitting' | 'streaming' | 'error'

/**
 * Provides controls and state for managing the chat session.
 */
export interface GyomuChatHandle {
  /**
   * The current collection of messages in the chat session.
   */
  readonly messages: ReadonlyArray<Message>

  /**
   * The current lifecycle status of the chat session.
   */
  readonly status: GyomuChatStatus

  /**
   * The current chat error, if any.
   */
  readonly error?: PublicError

  /**
   * Sends a message to the chat service.
   */
  readonly sendMessage: (input: SendMessageInput) => Promise<void>

  /**
   * Programmatically pushes a UI error to be handled by the configured policy.
   */
  readonly pushUiError: (error: PublicError) => void

  /**
   * Stops the active chat process.
   */
  readonly stop: () => void
}

/**
 * React hook for managing a chat session using the Gyomu chat transport.
 */
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
