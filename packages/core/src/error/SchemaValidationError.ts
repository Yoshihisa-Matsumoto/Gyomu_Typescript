import { severity } from 'effect/ErrorReporter';
import { AppErrorContext, Severity, withErrorTraits } from './BaseError.js';
import { Data } from 'effect';

interface SchemaErrorContext extends AppErrorContext {
  schemaName: string;
  phase: 'decode' | 'encode';
  issues?: unknown; // SchemaErrorの詳細
}

export class SchemaValidationError extends withErrorTraits(
  Data.TaggedError('SchemaErrorContext')<SchemaErrorContext>,
) {}
