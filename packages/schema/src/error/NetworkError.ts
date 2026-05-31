import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

export type NetworkOperation = 'upload' | 'download' | 'connect' | 'request'

export interface NetworkErrorContext extends AppErrorContext {
  readonly operation: NetworkOperation
  readonly endpoint?: string // 例: ftp://host/path
  readonly retryable: boolean // 通信系はここで判断できると強い
}
export const isRetryableNetworkError = (e: unknown): boolean => {
  if (!(e instanceof Error)) return false

  const msg = e.message.toLowerCase()

  return (
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('temporarily') ||
    msg.includes('network')
  )
}
export class NetworkError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/NetworkError')<NetworkErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable
    },
  },
) {}
