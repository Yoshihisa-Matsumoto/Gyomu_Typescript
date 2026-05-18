import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

interface DBErrorContext extends AppErrorContext {
  readonly operation?: 'select' | 'insert' | 'update' | 'delete' | 'custom'
  readonly table?: string
  readonly query?: string
  readonly params?: unknown
}
export class DBError extends withErrorTraits(Data.TaggedError('ValueError')<DBErrorContext>) {}
