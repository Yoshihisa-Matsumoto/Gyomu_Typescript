import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

export interface AccessErrorContext extends AppErrorContext {
  readonly resource: string // fileName
  readonly reason: 'in_use' | 'locked' | 'permission_denied' | 'not_exist' | 'invalid'
}
export class AccessError extends withErrorTraits(
  Data.TaggedError('AccessError')<AccessErrorContext>,
) {}
