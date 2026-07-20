import { Schema } from 'effect'
import { TypeProperty } from '../TypeProperty.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents a tuple type.
 *
 * @example
 * ```ts
 * [string, number]
 * ```
 *
 * @example
 * ```ts
 * readonly [name: string, age?: number]
 * ```
 *
 * Corresponds to TypeScript's `TupleTypeNode`.
 */
export interface TupleStructureAnalysis extends StructureBase {
  readonly kind: 'tuple'

  /**
   * Tuple elements.
   */
  readonly elements: ReadonlyArray<TypeProperty>
}

export const TupleStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('tuple'),

  elements: Schema.Array(Schema.suspend(() => TypeProperty)).annotate({
    description: 'Tuple elements.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'TupleStructureAnalysis',
    title: 'TupleStructureAnalysis',
    description: 'Represents a tuple type.',
  }),
)
