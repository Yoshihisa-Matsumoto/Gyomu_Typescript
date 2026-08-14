import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export interface AwaitExpressionAnalysis {
  readonly kind: 'await'
  readonly expression: ExpressionAnalysis
}

export const AwaitExpressionAnalysis: Schema.Schema<AwaitExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('await'),
  expression: Schema.suspend(() => ExpressionAnalysis),
}).pipe(
  Schema.annotate({
    description:
      'An element representing an asynchronous operation using the await operator within a function body.',
  }),
)
