import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Represents a typeof expression analysis containing the operation kind and the target expression.
 */
export interface TypeOfExpressionAnalysis {
  /**
   * The literal kind discriminator for the typeof expression analysis.
   */
  readonly kind: 'typeof'

  /**
   * The expression being evaluated by the typeof operation.
   */
  readonly expression: ExpressionAnalysis
}

/**
 * An expression analysis representing a typeof operation on an expression.
 */
export const TypeOfExpressionAnalysis: Schema.Schema<TypeOfExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('typeof'),
  expression: Schema.suspend(() => ExpressionAnalysis),
}).pipe(
  Schema.annotate({
    description: 'An expression analysis representing a typeof operation on an expression.',
  }),
)
