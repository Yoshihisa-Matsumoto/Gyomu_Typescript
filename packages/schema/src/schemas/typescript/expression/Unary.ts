import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export const UnaryOperator = Schema.Literals(['++', '--', '+', '-', '~', '!'])
export type UnaryOperator = Schema.Schema.Type<typeof UnaryOperator>

export interface UnaryExpressionAnalysis {
  readonly kind: 'unary'
  readonly operator: UnaryOperator
  readonly operand: ExpressionAnalysis
  readonly prefix: boolean
}

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
