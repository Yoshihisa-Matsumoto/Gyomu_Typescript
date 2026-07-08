import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Represents a parenthesized type.
 *
 * Parenthesized types preserve the explicit grouping of a type expression.
 *
 * @example
 * ```ts
 * (Foo)
 * ```
 *
 * @example
 * ```ts
 * (A | B)[]
 * ```
 *
 * @example
 * ```ts
 * A | (B & C)
 * ```
 *
 * Corresponds to TypeScript's `ParenthesizedTypeNode`.
 */
export interface ParenthesizedStructureAnalysis extends StructureBase {
  readonly kind: 'parenthesized'

  /**
   * Type enclosed by the parentheses.
   */
  readonly type: TypeAnalysis
}

export const ParenthesizedStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('parenthesized'),

  type: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Type enclosed by the parentheses.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'ParenthesizedStructureAnalysis',
    title: 'ParenthesizedStructureAnalysis',
    description: 'Represents a parenthesized type.',
  }),
)
