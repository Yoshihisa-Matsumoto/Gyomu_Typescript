import { AiError, withOptional } from '@gyomu/schema'
import type { Message } from '@gyomu/schema/conversation'
import type { ModelMessage } from 'ai'

export const buildPrompt = (params: {
  readonly prompt?: string
  readonly messages?: ReadonlyArray<Message>
}):
  | { readonly prompt: string }
  | { readonly system?: string; readonly messages: Array<ModelMessage> } => {
  if (params.messages) {
    const systemMessage = params.messages.find((m) => m.role === 'system')
    const otherMessages = params.messages.filter((m) => m.role !== 'system')
    return {
      ...withOptional({ system: systemMessage?.content }),
      messages: otherMessages.map(
        (m) => ({ role: m.role, content: m.content }) satisfies ModelMessage,
      ),
    }
  }

  if (params.prompt) {
    return {
      prompt: params.prompt,
    }
  }

  throw new AiError({
    message: 'prompt or messages is required',

    operation: 'generate',
    model: 'unknown',
    phase: 'request',
    resolution: { _tag: 'fail' },

    cause: undefined,
  })
}
