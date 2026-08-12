import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export interface NewExpressionAnalysis {
  readonly kind: 'new'
  readonly callee: ExpressionAnalysis
  readonly arguments: ReadonlyArray<ExpressionAnalysis>
}
export const NewExpressionAnalysis: Schema.Schema<NewExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('new'),
  callee: Schema.suspend(() => ExpressionAnalysis),
  arguments: Schema.Array(Schema.suspend(() => ExpressionAnalysis)),
}).pipe(
  Schema.annotate({
    description:
      'An element representing an object construction using the new operator within a function body.',
  }),
)
