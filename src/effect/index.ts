import { Effect, Option, pipe, Redacted } from 'effect';
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

export const unwrapPassword = (
  password: Option.Option<Redacted.Redacted<string>>,
): string | undefined =>
  pipe(password, Option.map(Redacted.value), Option.getOrUndefined);
