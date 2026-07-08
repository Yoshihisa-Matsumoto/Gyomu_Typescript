import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Represents a unary type operator.
 *
 * @example
 * ```ts
 * keyof T
 * ```
 *
 * @example
 * ```ts
 * unique symbol
 * ```
 *
 * @example
 * ```ts
 * readonly string[]
 * ```
 *
 * Corresponds to TypeScript's `TypeOperatorNode`.
 */
export interface TypeOperatorStructureAnalysis extends StructureBase {
  readonly kind: 'typeOperator'

  /**
   * Type operator.
   */
  readonly operator: 'keyof' | 'unique' | 'readonly'

  /**
   * Operand of the type operator.
   */
  readonly target: TypeAnalysis
}

export const TypeOperatorStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('typeOperator'),

  operator: Schema.Union([
    Schema.Literal('keyof'),
    Schema.Literal('unique'),
    Schema.Literal('readonly'),
  ]).annotate({
    description: 'Type operator.',
  }),

  target: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Operand of the type operator.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'TypeOperatorStructureAnalysis',
    title: 'TypeOperatorStructureAnalysis',
    description: 'Represents a unary type operator.',
  }),
)
