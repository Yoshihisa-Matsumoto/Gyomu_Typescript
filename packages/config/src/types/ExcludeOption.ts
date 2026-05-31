import type { Option } from 'effect/Option'

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
