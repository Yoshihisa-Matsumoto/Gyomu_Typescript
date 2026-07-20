import type { RetryOption } from '@gyomu/schema'

export interface AiExecutionContext {
  readonly system?: string
  readonly temperature?: number

  readonly abortSignal?: AbortSignal
  readonly headers?: Record<string, string>

  readonly retryOption?: RetryOption | undefined
}
