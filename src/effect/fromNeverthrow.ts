import { Effect } from 'effect/index';
import { AppError } from '../base-error';
import { fail, GyomuEffect, succeed } from './index';
import { GyomuResult, GyomuResultAsync } from '../result';
export const fromResult = <T>(r: GyomuResult<T>): GyomuEffect<T> => {
  return r.match(
    (v: T) => succeed(v),
    (e) => fail(e),
  );
};

export const fromGyomuResultAsync = <T>(
  r: GyomuResultAsync<T>,
): GyomuEffect<T> => {
  return Effect.tryPromise({
    try: () =>
      r.match(
        (v) => v,
        (e) => {
          throw e;
        },
      ),
    catch: (e) => e as AppError,
  });
};
