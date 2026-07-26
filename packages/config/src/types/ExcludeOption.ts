import type { Option } from 'effect/Option'

/**
 * Recursively extracts the inner type from an `Option` type, returning `undefined` for `None` values.
 *
 * @template T The type to transform.
 */
export type ExcludeOption<T> =
  T extends Option<infer A>
    ? A | undefined
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<ExcludeOption<U>>
      : T extends object
        ? {
            [K in keyof T]: ExcludeOption<T[K]>
          }
        : T
