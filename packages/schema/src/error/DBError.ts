import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

interface DBErrorContext extends AppErrorContext {
  readonly operation?: 'select' | 'insert' | 'update' | 'delete' | 'custom'
  readonly table?: string
  readonly query?: string
  readonly params?: unknown
}

/**
 * Represents an error encountered during database operations, containing the relevant error context.
 */
export class DBError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/DBError')<DBErrorContext>,
) {}
