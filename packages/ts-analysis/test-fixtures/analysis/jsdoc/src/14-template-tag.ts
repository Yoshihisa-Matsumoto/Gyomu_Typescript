/**
 * Generic function
 *
 * @template T Item type
 * @template TResult Result type
 */
export function generic<T, TResult>(value: T): TResult {
  throw new Error()
}

/**
 * @template T
 */
export function generic2<T, TResult>(value: T): TResult {
  throw new Error()
}
