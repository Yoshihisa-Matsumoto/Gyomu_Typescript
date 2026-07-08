import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Represents a type predicate.
 *
 * Type predicates are used as function or method return types to
 * narrow the type of a value.
 *
 * @example
 * ```ts
 * function isUser(value: unknown): value is User
 * ```
 *
 * @example
 * ```ts
 * function assertUser(value: unknown): asserts value is User
 * ```
 *
 * Corresponds to TypeScript's `TypePredicateNode`.
 */
export interface TypePredicateAnalysis extends StructureBase {
  readonly kind: 'typePredicate'

  /**
   * Name of the parameter being narrowed.
   *
   * @example
   * `value is User` → `"value"`
   */
  readonly parameterName: string

  /**
   * Type after successful narrowing.
   *
   * @example
   * `value is User` → `User`
   */
  readonly type: TypeAnalysis

  /**
   * Whether this predicate uses the `asserts` keyword.
   *
   * @example
   * `asserts value is User`
   */
  readonly asserts: boolean
}
export const TypePredicateAnalysis = Schema.Struct({
  kind: Schema.Literal('typePredicate'),

  parameterName: Schema.String.annotate({
    description: 'Name of the parameter being narrowed.',
  }),

  type: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Type after successful narrowing.',
  }),

  asserts: Schema.Boolean.annotate({
    description: 'Whether the predicate uses the `asserts` keyword.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'TypePredicateAnalysis',
    title: 'TypePredicateAnalysis',
    description: 'Represents a TypeScript type predicate.',
  }),
)
