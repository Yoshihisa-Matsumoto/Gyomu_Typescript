import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

export type AiProviderPhase = 'config' | 'provider-init' | 'model-resolve'

export interface AiProviderErrorContext extends AppErrorContext {
  readonly provider: string
  readonly phase: AiProviderPhase
  readonly retryable: boolean
}

export class AiProviderError extends withErrorTraits(
  Data.TaggedError('AiProviderError')<AiProviderErrorContext>,
  {
    isRetryable: (ctx) => ctx.retryable,
  },
) {}
