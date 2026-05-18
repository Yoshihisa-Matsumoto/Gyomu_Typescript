import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import { AccessError } from './AccessError.js'
import { ConfigError } from './ConfigError.js'
import { AiError } from './AiError.js'
import { DBError } from './DBError.js'
import { IOError } from './IOError.js'
import { NetworkError } from './NetworkError.js'
import type { AppErrorContext } from './BaseError.js'

export interface GyomuErrorContext extends AppErrorContext {
  readonly operation: string // fetchHoliday
  readonly domain: string // market / file / ai
  readonly reason: 'invalid_input' | 'not_found' | 'external_failure' | 'unexpected'
  readonly retryable?: boolean
}

const isAccessError = (e: unknown) => e instanceof AccessError
const isConfigError = (e: unknown) => e instanceof ConfigError
const isNetworkError = (e: unknown) => e instanceof NetworkError
const isIOError = (e: unknown) => e instanceof IOError
const isAIError = (e: unknown) => e instanceof AiError
const isDBError = (e: unknown) => e instanceof DBError
export const mapGyomuReason = (e: unknown): GyomuErrorContext['reason'] => {
  if (isAccessError(e)) return 'invalid_input'
  if (isConfigError(e)) return 'external_failure'
  if (isNetworkError(e)) return 'external_failure'
  if (isIOError(e)) return 'external_failure'
  if (isAIError(e)) return 'external_failure'
  if (isDBError(e)) return 'external_failure'

  return 'unexpected'
}
export class GyomuError extends withErrorTraits(Data.TaggedError('GyomuError')<GyomuErrorContext>, {
  isRetryable: (ctx) => {
    return ctx.retryable ?? false
  },
}) {}

export const gyomuExternalFailure = (operation: string, domain: string) => (e: unknown) =>
  new GyomuError({
    message: `${operation} failed`,
    operation,
    domain,
    reason: 'external_failure',
    cause: e,
  })
