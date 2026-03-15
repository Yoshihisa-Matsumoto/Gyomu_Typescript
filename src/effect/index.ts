import { Effect } from 'effect';
import { AppError, AppErrorCtor } from '../base-error.js';
import { unknownError } from '../errors.js';

export const tryAsync = <A, E extends AppError>(
  f: () => Promise<A>,
  ErrorType: AppErrorCtor<E>,
  message: string,
): Effect.Effect<A, E> =>
  Effect.tryPromise({
    try: f,
    catch: (e) => unknownError(ErrorType, e, message),
  });
