import { Schema } from 'effect'
import { TypeAnalysis } from '../TypeAnalysis.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents an inferred type variable declared with the `infer` keyword.
 *
 * Infer types can only appear within the `extends` clause of a conditional type.
 *
 * @example
 * ```ts
 * T extends (infer U)[] ? U : T
 * ```
 *
 * @example
 * ```ts
 * T extends Promise<infer TResult> ? TResult : T
 * ```
 *
 * Corresponds to TypeScript's `InferTypeNode`.
 */
export interface InferStructureAnalysis extends StructureBase {
  readonly kind: 'infer'

  /**
   * Name of the inferred type parameter.
   */
  readonly parameter: string

  /**
   * Optional constraint on the inferred type parameter.
   *
   * @example
   * infer U extends string
   */
  readonly constraint: TypeAnalysis | undefined
}

export const InferStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('infer'),

  parameter: Schema.String.annotate({
    description: 'Name of the inferred type parameter.',
  }),

  constraint: Schema.optional(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'Optional constraint on the inferred type parameter.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'InferStructureAnalysis',
    title: 'InferStructureAnalysis',
    description: 'Represents an inferred type variable declared with the infer keyword.',
  }),
)
