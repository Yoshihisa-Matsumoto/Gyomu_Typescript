import { Effect } from 'effect';
import { AppError, AppErrorCtor } from '../../base-error.js';
import { unknownError } from '../../errors.js';

export const fromPromise =
  <E extends AppError>(ErrorType: AppErrorCtor<E>, message: string) =>
  <A>(f: () => Promise<A>): Effect.Effect<A, E> =>
    Effect.tryPromise({
      try: f,
      catch: (e) => unknownError(ErrorType, e, message),
    });

export const fromSync =
  <E extends AppError>(ErrorType: AppErrorCtor<E>, message: string) =>
  <A>(f: () => A): Effect.Effect<A, E> =>
    Effect.try({
      try: f,
      catch: (e) => unknownError(ErrorType, e, message),
    });
export function ensure<E extends AppError>(
  condition: boolean,
  ErrorType: AppErrorCtor<E>,
  message: string,
): Effect.Effect<boolean, E> {
  return condition
    ? Effect.succeed(condition)
    : Effect.fail<E>(new ErrorType(message) as E);
}
