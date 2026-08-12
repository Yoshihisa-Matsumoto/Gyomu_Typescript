import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export interface ComputedAccessExpressionAnalysis {
  readonly kind: 'computed-access'
  readonly object: ExpressionAnalysis
  readonly index: ExpressionAnalysis
  readonly optional: boolean
}
export const ComputedAccessExpressionAnalysis: Schema.Schema<ComputedAccessExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('computed-access'),
    object: Schema.suspend(() => ExpressionAnalysis),
    index: Schema.suspend(() => ExpressionAnalysis),
    optional: Schema.Boolean,
  }).pipe(
    Schema.annotate({
      description:
        'An expression analysis representing access to an object property using a computed index expression.',
    }),
  )
