import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Defines valid unary operators including increment, decrement, arithmetic, bitwise, and logical negation.
 */
export const UnaryOperator = Schema.Literals(['++', '--', '+', '-', '~', '!'])

/**
 * Represents a unary operator type derived from UnaryOperator literals.
 */
export type UnaryOperator = Schema.Schema.Type<typeof UnaryOperator>

/**
 * Represents the analysis result for a unary expression containing operator, operand, and prefix indicator.
 */
export interface UnaryExpressionAnalysis {
  /**
   * Discriminator property set to 'unary'.
   */
  readonly kind: 'unary'

  /**
   * The unary operator applied in the expression.
   */
  readonly operator: UnaryOperator

  /**
   * The expression analysis for the operand.
   */
  readonly operand: ExpressionAnalysis

  /**
   * Indicates whether the operator appears before or after the operand.
   */
  readonly prefix: boolean
}

/**
 * Schema defining the analysis result for a unary expression, including its operator, operand, and prefix positioning.
 */
export const UnaryExpressionAnalysis: Schema.Schema<UnaryExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('unary'),
  operator: UnaryOperator,
  operand: Schema.suspend(() => ExpressionAnalysis),
  prefix: Schema.Boolean,
}).pipe(
  Schema.annotate({
    description:
      'Analysis result for a unary expression. The prefix property indicates whether the operator appears before or after the operand.',
  }),
)
