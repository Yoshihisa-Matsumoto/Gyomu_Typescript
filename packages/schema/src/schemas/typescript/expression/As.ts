import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Represents an analysis of a type assertion expression using the as operator.
 */
export interface AsExpressionAnalysis {
  /**
   * The kind discriminator for the type assertion expression.
   */
  readonly kind: 'as'

  /**
   * The expression being asserted.
   */
  readonly expression: ExpressionAnalysis

  /**
   * The target type of the assertion.
   */
  readonly type: TypeAnalysis
}

/**
 * An element representing a type assertion using the as operator.
 */
export const AsExpressionAnalysis: Schema.Schema<AsExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('as'),
  expression: Schema.suspend(() => ExpressionAnalysis),
  type: Schema.suspend(() => TypeAnalysis),
}).pipe(
  Schema.annotate({
    description: 'An element representing a type assertion using the as operator.',
  }),
)
