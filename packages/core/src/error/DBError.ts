import { Data } from 'effect';
import { AppErrorContext, withErrorTraits } from './BaseError.js';

interface DBErrorContext extends AppErrorContext {
  readonly operation?: 'select' | 'insert' | 'update' | 'delete' | 'custom';
  readonly table?: string;
  readonly query?: string;
  readonly params?: unknown;
}
export class DBError extends withErrorTraits(
  Data.TaggedError('ValueError')<DBErrorContext>,
) {}
interface DBErrorDetails {
  table: string;
  operation: DBErrorContext['operation'];
  message: string;
  context?: string;
  [key: string]: unknown;
}
