import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

export type IOLayer = 'stream' | 'filesystem' | 'csv' | 'archive'

export type IOOperation = 'read' | 'write' | 'open' | 'close' | 'transform'

export interface IOErrorContext extends AppErrorContext {
  readonly layer: IOLayer
  readonly operation: IOOperation
  readonly target?: string // fileName / entryName / path
  readonly retryable?: boolean
}
export class IOError extends withErrorTraits(Data.TaggedError('IOError')<IOErrorContext>, {
  isRetryable: (ctx) => {
    return ctx.retryable ?? false
  },
}) {}
