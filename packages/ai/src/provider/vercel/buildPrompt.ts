import { AiError } from '@gyomu/schema'
import type { Message } from '@gyomu/schema/conversation'
import type { ModelMessage } from 'ai'

export const buildPrompt = (params: {
  readonly prompt?: string
  readonly messages?: ReadonlyArray<Message>
}): { readonly prompt: string } | { readonly messages: Array<ModelMessage> } => {
  if (params.messages) {
    return {
      messages: params.messages.map(
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

    retryable: false,
    cause: undefined,
  })
}
