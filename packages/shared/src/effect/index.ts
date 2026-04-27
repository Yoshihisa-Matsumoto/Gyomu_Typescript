import { Effect } from 'effect';
import { AppError, AppErrorCtor } from '../error/BaseError.js';
import { unknownError } from '../error/BaseError.js';

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
): Effect.Effect<void, E> {
  return condition ? Effect.void : Effect.fail<E>(new ErrorType(message) as E);
}
export function ensureEffect<E extends AppError>(
  condition: Effect.Effect<boolean, any, any>,
  ErrorType: AppErrorCtor<E>,
  message: string,
): Effect.Effect<void, E, any> {
  return Effect.gen(function* () {
    if (
      yield* condition.pipe(
        Effect.map((e) => unknownError(ErrorType, e, message)),
      )
    )
      return;
    throw new ErrorType(message);
  });
}
