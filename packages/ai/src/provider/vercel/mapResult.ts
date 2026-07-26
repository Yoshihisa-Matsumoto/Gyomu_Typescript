import { withOptional } from '@gyomu/schema'
import type {
  AiFinishReason,
  AiGenerateTextResult,
  AiMessagePart,
  AiTextPart,
} from '../types/AiModelService.js'
import type { FinishReason, generateText } from 'ai'

/**
 * Maps a Vercel finish reason to the standard AiFinishReason.
 *
 * @param reason The finish reason provided by the Vercel provider.
 *
 * @returns The corresponding AiFinishReason.
 */
export const mapVercelFinishReason = (reason: FinishReason | undefined): AiFinishReason => {
  switch (reason) {
    case 'stop':
      return 'completed'

    case 'length':
      return 'max-tokens'

    case 'tool-calls':
      return 'tool-call'

    case 'content-filter':
      return 'content-filtered'

    case 'error':
      return 'error'

    default:
      return 'unknown'
  }
}

type GenerateTextLikeResult = Pick<
  Awaited<ReturnType<typeof generateText>>,
  'text' | 'toolCalls' | 'usage' | 'finishReason'
>

/**
 * Maps a raw text generation result from Vercel to a standardized AiGenerateTextResult.
 *
 * @param result The raw generation result object from the Vercel provider.
 *
 * @returns The standardized AiGenerateTextResult containing the assistant message, usage information, and finish reason.
 */
export const mapGenerateTextResultToAiGenerateTextResult = (
  result: GenerateTextLikeResult,
): AiGenerateTextResult => {
  const parts: Array<AiMessagePart> = []

  if (result.text.length > 0) {
    parts.push({
      type: 'text',
      text: result.text,
    })
  }

  if (Array.isArray(result.toolCalls)) {
    for (const toolCall of result.toolCalls) {
      parts.push({
        type: 'tool-call',
        toolName: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        input: toolCall.input,
      })
    }
  }

  return {
    message: {
      role: 'assistant',
      parts,
      text: parts
        .filter((x): x is AiTextPart => x.type === 'text')
        .map((x) => x.text)
        .join(''),
    },
    ...withOptional(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      result.usage
        ? {
            usage: {
              inputTokens: result.usage.inputTokens ?? 0,
              outputTokens: result.usage.outputTokens ?? 0,
              totalTokens: result.usage.totalTokens,
            },
          }
        : {},
    ),

    finishReason: mapVercelFinishReason(result.finishReason),
  }
}
