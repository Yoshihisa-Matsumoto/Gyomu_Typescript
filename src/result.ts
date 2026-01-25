import { errAsync, okAsync, Result, ResultAsync } from 'neverthrow';

export {
  ok,
  Ok,
  err,
  Err,
  Result,
  okAsync,
  errAsync,
  ResultAsync,
  fromAsyncThrowable,
  fromThrowable,
  fromPromise,
  fromSafePromise,
  safeTry,
} from 'neverthrow';

export function result2Async<T, E>(
  r: Result<T, E>
): ResultAsync<T, E> {
  return r.isOk()
    ? okAsync(r.value)
    : errAsync(r.error);
}