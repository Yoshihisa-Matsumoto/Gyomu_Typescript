import type { RetryOption } from '@gyomu/schema'

/**
 * Defines the configuration and operational parameters for an AI execution context, including system instructions, model settings, request control, and retry behavior.
 */
export interface AiExecutionContext {
  /**
   * Optional system prompt defining the AI's behavior or role.
   */
  readonly system?: string

  /**
   * Optional sampling temperature for randomness control.
   */
  readonly temperature?: number

  /**
   * Optional signal to abort the ongoing AI request.
   */
  readonly abortSignal?: AbortSignal

  /**
   * Optional HTTP headers to include with the request.
   */
  readonly headers?: Record<string, string>

  /**
   * Optional retry strategy configuration for handling failures.
   */
  readonly retryOption?: RetryOption | undefined
}
