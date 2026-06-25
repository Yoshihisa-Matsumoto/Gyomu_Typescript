import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

/**
 * Defines the category of AI operation being performed.
 */
export type AIOperation = 'generate' | 'stream' | 'embedding'

/**
 * Defines the specific lifecycle phase of an AI request where an error may occur.
 */
export type AIPhase =
  | 'request' // API呼び出し
  | 'response' // レスポンス受信
  | 'decode' // 内容不正
  | 'rate-limit'
  | 'tool-call'
  | 'stream'

type RetryStrategy =
  | {
      readonly _tag: 'none'
    }
  | {
      readonly _tag: 'exponential'
    }
  | {
      readonly _tag: 'retry-after'
      readonly delayMs: number
    }

/**
 * Defines the contextual information associated with an AI error, including the operation type, the specific phase, model details, and retry configuration.
 */
export interface AIErrorContext extends AppErrorContext {
  /**
   * The type of AI operation attempted.
   */
  readonly operation: AIOperation

  /**
   * The identifier of the AI model used.
   */
  readonly model: string

  /**
   * The lifecycle phase in which the error occurred.
   */
  readonly phase: AIPhase

  /**
   * Indicates whether the error is considered retryable.
   */
  readonly retryable: boolean

  /**
   * The strategy configuration used for retries.
   */
  readonly retryStrategy: RetryStrategy

  /**
   * An optional HTTP-like status code associated with the error.
   */
  readonly statusCode?: number
}

/**
 * Represents an error that occurred during an AI operation, carrying detailed context for observability and retry logic.
 */
export class AiError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/AiError')<AIErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable
    },
  },
) {}

// export const isRetryableAiError = (e: unknown): boolean => {
//   if (!(e instanceof Error)) return false

//   const msg = e.message.toLowerCase()

//   return (
//     msg.includes('timeout') ||
//     msg.includes('rate limit') ||
//     msg.includes('temporarily') ||
//     msg.includes('network')
//   )
// }
