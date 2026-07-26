import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

/**
 * Defines the initialization phases for an AI provider.
 */
export type AiProviderPhase = 'config' | 'provider-init' | 'model-resolve'

/**
 * Represents the error context for an AI provider operation, including the provider identity, the lifecycle phase where the error occurred, and whether the error can be retried.
 */
export interface AiProviderErrorContext extends AppErrorContext {
  /**
   * The name or identifier of the AI provider.
   */
  readonly provider: string

  /**
   * The specific initialization phase during which the error occurred.
   */
  readonly phase: AiProviderPhase

  /**
   * Indicates whether the error is considered retryable.
   */
  readonly retryable: boolean
}

/**
 * Represents an error that occurred during AI provider operations.
 */
export class AiProviderError extends withErrorTraits(
  Data.TaggedError('AiProviderError')<AiProviderErrorContext>,
  {
    isRetryable: (ctx) => ctx.retryable,
  },
) {}
