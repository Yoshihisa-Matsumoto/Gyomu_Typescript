import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export interface AsExpressionAnalysis {
  readonly kind: 'as'
  readonly expression: ExpressionAnalysis
  readonly type: TypeAnalysis
}

export const AsExpressionAnalysis: Schema.Schema<AsExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('as'),
  expression: Schema.suspend(() => ExpressionAnalysis),
  type: Schema.suspend(() => TypeAnalysis),
}).pipe(
  Schema.annotate({
    description: 'An element representing a type assertion using the as operator.',
  }),
)
