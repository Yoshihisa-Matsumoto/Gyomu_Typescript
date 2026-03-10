import { Effect } from 'effect';
import { AppError, AppErrorCtor } from '../base-error';
import { unknownError } from '../errors';
export { Stream } from 'effect';
export { Chunk } from 'effect';
export { Effect } from 'effect';
export { Context } from 'effect';
export { Layer } from 'effect';
export { Fiber } from 'effect';
export { Scope } from 'effect/Scope';

export type GyomuEffect<T> = Effect.Effect<T, AppError>;
export const succeed = Effect.succeed;
export const fail = Effect.fail;

export const tryAsync = <A, E extends AppError>(
  f: () => Promise<A>,
  ErrorType: AppErrorCtor<E>,
  message: string,
): GyomuEffect<A> =>
  Effect.tryPromise({
    try: f,
    catch: (e) => unknownError(ErrorType, e, message),
  });
