import { Data } from 'effect'
import { PlatformError, SystemError } from 'effect/PlatformError'
import { withOptional } from '../option.js'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

export type IOLayer = 'stream' | 'filesystem' | 'csv' | 'archive'

export type IOOperation = 'read' | 'write' | 'open' | 'close' | 'transform'

export interface IOErrorContext extends AppErrorContext {
  readonly layer: IOLayer
  readonly operation: IOOperation
  readonly target?: string // fileName / entryName / path
  readonly retryable?: boolean
  readonly reason?: string
}
export class IOError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/IOError')<IOErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable ?? false
    },
  },
) {}

export function wrapIOError(
  error: unknown,
  buildContext?: (e: unknown) => Partial<IOErrorContext>,
): IOError {
  if (error instanceof IOError) return error

  const base = (buildContext?.(error) ?? {}) as IOErrorContext

  const reason =
    error instanceof PlatformError
      ? error.reason instanceof SystemError
        ? error.reason._tag
        : undefined
      : undefined

  return new IOError({
    ...base,
    message: base.message,
    cause: error instanceof Error ? error : new Error(String(error)),
    ...withOptional({ reason }),
  })
}
