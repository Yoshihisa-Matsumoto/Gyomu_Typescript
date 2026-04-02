import { Effect, Option, pipe, Redacted, Stream } from 'effect';
import { AppError, AppErrorCtor } from '../base-error.js';
import { NetworkError, unknownError } from '../errors.js';

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

export const fromReadableStream =
  <E>(onError: (e: unknown) => E) =>
  (f: () => ReadableStream<Uint8Array>): Stream.Stream<Uint8Array, E> =>
    Stream.fromReadableStream({
      evaluate: f,
      onError,
    });
export const networkStream = (
  f: () => ReadableStream<Uint8Array>,
  context: string,
) =>
  Stream.fromReadableStream({
    evaluate: f,
    onError: (e) => new NetworkError(`${context}: ${String(e)}`),
  });

export const unwrapPassword = (
  password: Option.Option<Redacted.Redacted<string>>,
): string | undefined =>
  pipe(password, Option.map(Redacted.value), Option.getOrUndefined);

export function ensure<E extends AppError>(
  condition: boolean,
  ErrorType: AppErrorCtor<E>,
  message: string,
): Effect.Effect<boolean, E> {
  return condition
    ? Effect.succeed(condition)
    : Effect.fail<E>(new ErrorType(message) as E);
}
