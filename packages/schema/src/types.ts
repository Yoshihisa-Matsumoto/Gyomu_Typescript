import { Brand } from 'effect'
import type { Config, Option } from 'effect'

/**
 * Recursively makes all properties of an object type optional.
 *
 * @template T The type to transform.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P]
}

/**
 * Extracts the internal configuration type from a Config schema definition.
 *
 * @template T The Config type to extract from.
 */
export type ExtractConfig<T> = T extends Config.Config<infer A> ? A : never
// type UnwrapOption<T> = T extends Option.Option<infer A> ? A | undefined : T;

/**
 * Normalizes an object type by extracting the value type from any properties wrapped in Option.
 *
 * @template T The input object type containing potential Option properties.
 */
export type NormalizeOptionObject<T> = {
  [K in keyof T as T[K] extends Option.Option<any> ? K : never]?: T[K] extends Option.Option<
    infer A
  >
    ? A
    : never
} & {
  [K in keyof T as T[K] extends Option.Option<any> ? never : K]: T[K]
}

/**
 * Represents an absolute file system path as a string.
 */
export type FullPath = Brand.Branded<string, 'FullPath'>

/**
 * Nominal brand utility for FullPath.
 */
export const FullPath = Brand.nominal<FullPath>()
