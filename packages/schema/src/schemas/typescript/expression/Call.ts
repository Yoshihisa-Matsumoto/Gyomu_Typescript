import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export interface CallExpressionAnalysis {
  readonly kind: 'call'
  readonly callee: ExpressionAnalysis
  readonly arguments: ReadonlyArray<ExpressionAnalysis>
  readonly optional: boolean
}

export const CallExpressionAnalysis: Schema.Schema<CallExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('call'),
  callee: Schema.suspend(() => ExpressionAnalysis),
  arguments: Schema.Array(Schema.suspend(() => ExpressionAnalysis)),
  optional: Schema.Boolean,
}).pipe(
  Schema.annotate({
    description:
      'An expression analysis representing a function or method call and its invocation arguments.',
  }),
)
