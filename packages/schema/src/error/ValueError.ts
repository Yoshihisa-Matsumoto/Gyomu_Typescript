import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { AppErrorContext } from './BaseError.js'

interface ValueErrorShape extends AppErrorContext {
  field?: string
  value?: unknown
  expected?: unknown
}

// export class ValueError extends AppError<ValueErrorShape> {
//   readonly severity = Severity.ERROR;

//   isRetryable() {
//     return false;
//   }

//   constructor(ctx: ValueErrorShape) {
//     super(ctx);
//   }
// }

/**
 * Represents an error occurring when a value does not conform to the expected schema, providing structured metadata about the validation failure.
 */
export class ValueError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/ValueError')<ValueErrorShape>,
) {}
