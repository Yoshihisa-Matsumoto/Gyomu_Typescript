import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

export type AIOperation = 'generate' | 'stream'

export type AIPhase =
  | 'request' // API呼び出し
  | 'response' // レスポンス受信
  | 'decode' // 内容不正

export interface AIErrorContext extends AppErrorContext {
  readonly operation: AIOperation
  readonly model: string
  readonly phase: AIPhase
  readonly retryable: boolean
}
export class AIError extends withErrorTraits(Data.TaggedError('Ai Error')<AIErrorContext>, {
  isRetryable: (ctx) => {
    return ctx.retryable
  },
}) {}

export const isRetryableAiError = (e: unknown): boolean => {
  if (!(e instanceof Error)) return false

  const msg = e.message.toLowerCase()

  return (
    msg.includes('timeout') ||
    msg.includes('rate limit') ||
    msg.includes('temporarily') ||
    msg.includes('network')
  )
}
