// import {
//   ok as _ok,
//   err as _err,
//   okAsync as _okAsync,
//   errAsync as _errAsync,
//   ResultAsync,
//   Result,
// } from 'neverthrow';
// import { AppError, AppErrorCtor } from './base-error.js';
// import { unknownError } from './errors.js';
// import { EventEmitter } from 'stream';

// export type GyomuResult<T> = Result<T, AppError>;
// export type GyomuResultAsync<T> = ResultAsync<T, AppError>;

// export type GyomuResultType<R> =
//   R extends GyomuResultAsync<infer T> ? T : never;

// export const ok = <T, E extends AppError>(value: T): GyomuResult<T> =>
//   _ok<T, E>(value);
// export const err = <E extends AppError>(error: E): GyomuResult<never> =>
//   _err(error);
// export const okAsync = <T, E extends AppError>(value: T): GyomuResultAsync<T> =>
//   _okAsync<T, E>(value);
// export const errAsync = <E extends AppError>(
//   error: E,
// ): GyomuResultAsync<never> => _errAsync(error);
// export const simpleErr = <E extends AppError>(
//   ErrorType: AppErrorCtor<E>,
//   message: string,
// ): GyomuResult<never> => err(new ErrorType(message));
// export const simpleErrAsync = <E extends AppError>(
//   ErrorType: AppErrorCtor<E>,
//   message: string,
// ): GyomuResultAsync<never> => errAsync(new ErrorType(message));

// export function runAsync<T, E extends AppError>(
//   promise: () => Promise<T>,
//   ErrorType: AppErrorCtor<E>,
//   message?: string,
// ): GyomuResultAsync<T> {
//   if (typeof promise !== 'function') {
//     throw new TypeError('runAsync: promise is not a function');
//   }
//   return ResultAsync.fromPromise(promise(), (e) =>
//     unknownError(ErrorType, e, message),
//   );
// }

// type ErrorMapper<E extends AppError> = (e: unknown) => E;
// export function runAsyncCustom<T, E extends AppError>(
//   promise: () => Promise<T>,
//   mapError: ErrorMapper<E>,
// ): GyomuResultAsync<T> {
//   if (typeof promise !== 'function') {
//     throw new TypeError('runAsync: promise is not a function');
//   }
//   return ResultAsync.fromPromise(promise(), mapError);
// }

// export function run<T, E extends AppError>(
//   fn: () => T,
//   ErrorType: AppErrorCtor<E>,
//   message?: string,
// ): GyomuResult<T> {
//   return Result.fromThrowable(fn, (e) => unknownError(ErrorType, e, message))();
// }
// export function runCustom<T, E extends AppError>(
//   fn: () => T,
//   mapError: ErrorMapper<E>,
// ): GyomuResult<T> {
//   return Result.fromThrowable(fn, mapError)();
// }

// export function ensure<E extends AppError>(
//   condition: boolean,
//   ErrorType: AppErrorCtor<E>,
//   message: string,
// ): GyomuResult<boolean> {
//   return condition ? ok(condition) : err(new ErrorType(message));
// }
// export function ensureAsync<E extends AppError>(
//   fn: () => Promise<boolean>,
//   ErrorType: AppErrorCtor<E>,
//   message: string,
// ): GyomuResultAsync<boolean> {
//   return runAsync(
//     async () => {
//       if (!(await fn())) {
//         throw new ErrorType(message);
//       }
//       return true;
//     },
//     ErrorType,
//     message,
//   );
// }

// export function result2Async<T>(r: GyomuResult<T>): GyomuResultAsync<T> {
//   return r.isOk() ? okAsync(r.value) : errAsync(r.error);
// }

// export function allResultsOk<T extends readonly unknown[]>(results: {
//   [K in keyof T]: GyomuResultAsync<T[K]>;
// }): GyomuResultAsync<T>;
// export function allResultsOk(
//   results: ResultAsync<any, AppError>[],
// ): GyomuResultAsync<unknown[]> {
//   return ResultAsync.combine(results);
// }

// export function withRetry<T>(
//   fn: () => GyomuResultAsync<T>,
//   max = 3,
// ): GyomuResultAsync<T> {
//   return fn().orElse((err) => {
//     if (err.isRetryable() && max > 0) {
//       return withRetry(fn, max - 1);
//     }
//     return errAsync(err);
//   });
// }

// export function withRetryDelay<T, E extends AppError>(
//   fn: () => GyomuResultAsync<T>,
//   options: {
//     maxRetries: number;
//     retryOn: (error: AppError) => boolean;
//     delayMs: number;
//   },
//   ErrorType: AppErrorCtor<E>,
//   message?: string,
// ): GyomuResultAsync<T> {
//   let attempt = 0;
//   return runAsync(
//     async () => {
//       while (true) {
//         const result = await fn();
//         if (result.isOk()) return result.value;
//         if (attempt > options.maxRetries || !options.retryOn(result.error))
//           throw result.error;
//         attempt++;
//         await delay(options.delayMs);
//       }
//     },
//     ErrorType,
//     message,
//   );
// }
// async function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// export function toPromise<T>(value: T | PromiseLike<T>): Promise<T> {
//   return Promise.resolve(value);
// }

// type PromiseOrEmitter<T> = Promise<T> | EventEmitter;
// export function toPromiseFromEmitter<T>(
//   value: PromiseOrEmitter<T>,
//   options?: { resolveEvent?: string; rejectEvent?: string },
// ): Promise<T> {
//   const resolveEvent = options?.resolveEvent ?? 'end';
//   const rejectEvent = options?.rejectEvent ?? 'error';

//   if (value instanceof Promise) {
//     return value;
//   }

//   return new Promise<T>((resolve, reject) => {
//     const emitter = value as EventEmitter;
//     emitter.once(resolveEvent, resolve);
//     emitter.once(rejectEvent, reject);
//   });
// }

// export function andAttachAs<T, K extends string, U>(
//   key: K,
//   f: (t: T) => GyomuResultAsync<U>,
// ) {
//   return (t: T): GyomuResultAsync<T & { [P in K]: U }> =>
//     f(t).map(
//       (value) =>
//         ({
//           ...t,
//           [key]: value,
//         }) as T & { [P in K]: U },
//     );
// }

// export function sequenceReduce<T, A>(
//   items: T[],
//   initial: A,
//   fn: (acc: A, item: T) => GyomuResultAsync<A>,
// ): GyomuResultAsync<A> {
//   return items.reduce(
//     (accResult, item) => accResult.andThen((acc) => fn(acc, item)),
//     okAsync(initial),
//   );
// }

// export function sequenceMap<T, R>(
//   items: T[],
//   fn: (item: T) => GyomuResultAsync<R>,
// ): GyomuResultAsync<R[]> {
//   return items.reduce(
//     (accResult, item) =>
//       accResult.andThen((results) => fn(item).map((r) => [...results, r])),
//     okAsync<R[], AppError>([]),
//   );
// }

// export function sequenceTap<T>(
//   items: T[],
//   fn: (item: T) => GyomuResultAsync<any>,
// ): GyomuResultAsync<void> {
//   return ResultAsync.combine(items.map(fn)).map(() => undefined);
// }
