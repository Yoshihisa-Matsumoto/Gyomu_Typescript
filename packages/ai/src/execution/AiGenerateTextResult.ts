import type { AiAssistantMessage, AiFinishReason, AiUsage } from './types.js'

export interface AiGenerateTextResult {
  readonly message: AiAssistantMessage

  readonly usage?: AiUsage

  readonly finishReason?: AiFinishReason
}
