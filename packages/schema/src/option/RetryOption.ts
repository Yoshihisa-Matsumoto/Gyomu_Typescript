import type { AiError } from '../error/AiError.js'

export interface RetryObserver {
  onRetry: (params: { error: AiError; attempt: number; delayMs: number }) => void
}

export interface RetryOption {
  maxAttempts?: number
  observer?: RetryObserver
}
