import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export interface YieldExpressionAnalysis {
  readonly kind: 'yield'
  readonly expression?: ExpressionAnalysis | undefined
}

export const YieldExpressionAnalysis: Schema.Schema<YieldExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('yield'),
  expression: Schema.optional(Schema.suspend(() => ExpressionAnalysis)),
}).pipe(
  Schema.annotate({
    description: 'An element representing a yield operation within a function body.',
  }),
)
