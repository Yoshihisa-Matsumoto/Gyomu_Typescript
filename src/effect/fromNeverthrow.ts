// import { Effect } from 'effect';
// import { AppError } from '../base-error.js';

// import { GyomuResult, GyomuResultAsync } from '../result.js';
// export const fromResult = <T>(
//   r: GyomuResult<T>,
// ): Effect.Effect<T, AppError> => {
//   return r.match(
//     (v: T) => Effect.succeed(v),
//     (e) => Effect.fail(e),
//   );
// };

// export const fromGyomuResultAsync = <T>(
//   r: GyomuResultAsync<T>,
// ): Effect.Effect<T, AppError> => {
//   return Effect.tryPromise({
//     try: () =>
//       r.match(
//         (v) => v,
//         (e) => {
//           throw e;
//         },
//       ),
//     catch: (e) => e as AppError,
//   });
// };
