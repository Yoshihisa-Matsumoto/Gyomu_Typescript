import { Schema } from 'effect'
import { TypeAnalysis } from '../TypeAnalysis.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents a mapped type.
 *
 * @example
 * ```ts
 * type Readonly<T> = {
 *   readonly [K in keyof T]: T[K]
 * }
 * ```
 *
 * @example
 * ```ts
 * type FindByMethod<T, K extends string> = {
 *   [P in K]: (value: string) => T[]
 * }
 * ```
 *
 * Corresponds to TypeScript's `MappedTypeNode`.
 */
export type MappedStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  readonly kind: 'mapped'

  /**
   * Type parameter introduced by the mapped type.
   *
   * @example
   * `[K in keyof T]` → `"K"`
   */
  readonly parameter: string

  /**
   * Type that determines the set of keys.
   *
   * @example
   * `[K in keyof T]` → `keyof T`
   */
  readonly constraint: TypeAnalysis

  /**
   * Optional key remapping expression introduced with the `as` clause.
   *
   * @example
   * `[K in keyof T as Uppercase<K>]`
   */
  readonly nameType?: TypeAnalysis | undefined

  /**
   * Type assigned to each generated property.
   *
   * @example
   * `T[K]`
   */
  readonly valueType?: TypeAnalysis

  /**
   * Indicates whether generated properties are readonly.
   *
   * `conditional` represents `+readonly` / `-readonly`
   * modifiers that depend on the mapped type declaration.
   */
  readonly readonlyModifier: boolean | 'conditional'

  /**
   * Indicates whether generated properties are optional.
   *
   * `conditional` represents `+?` / `-?`
   * modifiers that depend on the mapped type declaration.
   */
  readonly optionalModifier: boolean | 'conditional'
} & StructureBase

/**
 * Represents an MappedType structure.
 */
export const MappedStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('mapped'),

  parameter: Schema.String.annotate({
    description: 'Type parameter introduced by the mapped type.',
  }),

  constraint: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Type that determines the set of generated keys.',
  }),

  nameType: Schema.optional(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'Optional key remapping expression (`as` clause).',
  }),

  valueType: Schema.optional(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'Type assigned to each generated property.',
  }),

  readonlyModifier: Schema.Union([Schema.Boolean, Schema.Literal('conditional')]).annotate({
    description: 'Readonly modifier of generated properties.',
  }),

  optionalModifier: Schema.Union([Schema.Boolean, Schema.Literal('conditional')]).annotate({
    description: 'Optional modifier of generated properties.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'MappedStructureAnalysis',
    title: 'MappedStructureAnalysis',
    description: 'Represents a mapped type.',
  }),
)
