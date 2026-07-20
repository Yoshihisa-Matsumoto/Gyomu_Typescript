import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'

/**
 * Represents the `this` type.
 *
 * @example
 * ```ts
 * this
 * ```
 *
 * @example
 * ```ts
 * this & Serializable
 * ```
 *
 * Corresponds to TypeScript's `ThisTypeNode`.
 */
export interface ThisStructureAnalysis extends StructureBase {
  readonly kind: 'this'
}

export const ThisStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('this'),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'ThisStructureAnalysis',
    title: 'ThisStructureAnalysis',
    description: 'Represents the this type.',
  }),
)
