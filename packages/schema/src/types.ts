import type { Config, Option } from 'effect'

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export type ExtractConfig<T> = T extends Config.Config<infer A> ? A : never
// type UnwrapOption<T> = T extends Option.Option<infer A> ? A | undefined : T;

export type NormalizeOptionObject<T> = {
  [K in keyof T as T[K] extends Option.Option<any> ? K : never]?: T[K] extends Option.Option<
    infer A
  >
    ? A
    : never
} & {
  [K in keyof T as T[K] extends Option.Option<any> ? never : K]: T[K]
}
