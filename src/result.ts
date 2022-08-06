import { BaseError } from './errors';

export type Result<T, E extends Error> = Success<T> | Failure<E>;
export type PromiseResult<T, E extends Error> = Promise<Result<T, E>>;

class Success<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<BaseError> {
    return false;
  }
}

export class Failure<E extends BaseError> {
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  isSuccess(): this is Success<unknown> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }
}

interface failOption {
  internalError?: Error;
  message?: string;
}

export function fail<E extends BaseError>(
  message: string,
  type: { new (message: string): E }
): Failure<E> {
  return new Failure(new type(message));
}

export function success<T>(object: T) {
  return new Success(object);
}
