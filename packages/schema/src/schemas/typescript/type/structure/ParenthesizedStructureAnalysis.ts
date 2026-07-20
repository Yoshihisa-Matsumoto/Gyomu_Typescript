import { Schema } from 'effect'
import { DecoratedStructureAnalysis } from './DecoratedStructureAnalysis.js'

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
export type ParenthesizedStructureAnalysis = typeof ParenthesizedStructureAnalysis.Type

export const ParenthesizedStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('parenthesized'),
}).pipe(
  Schema.fieldsAssign(DecoratedStructureAnalysis.fields),
  Schema.annotate({
    identifier: 'ParenthesizedStructureAnalysis',
    title: 'ParenthesizedStructureAnalysis',
    description: 'Represents a parenthesized type.',
  }),
)
