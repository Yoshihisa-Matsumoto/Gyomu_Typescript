import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export interface TypeOfExpressionAnalysis {
  readonly kind: 'typeof'
  readonly expression: ExpressionAnalysis
}

export const TypeOfExpressionAnalysis: Schema.Schema<TypeOfExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('typeof'),
  expression: Schema.suspend(() => ExpressionAnalysis),
}).pipe(
  Schema.annotate({
    description: 'An expression analysis representing a typeof operation on an expression.',
  }),
)
