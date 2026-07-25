import type { AiAssistantMessage, AiFinishReason, AiUsage } from './types.js'

/**
 * Represents the result of a text generation operation, containing the generated assistant message, optional usage statistics, and the finish reason.
 */
export interface AiGenerateTextResult {
  /**
   * The generated assistant message content.
   */
  readonly message: AiAssistantMessage

  /**
   * Optional token usage statistics for the generation request.
   */
  readonly usage?: AiUsage

  /**
   * Optional reason indicating why the generation process concluded.
   */
  readonly finishReason?: AiFinishReason
}
