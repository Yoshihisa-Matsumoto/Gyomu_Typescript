import { Schema } from 'effect'

export interface ThisExpressionAnalysis {
  readonly kind: 'this'
}

export interface SuperExpressionAnalysis {
  readonly kind: 'super'
}
export const ThisExpressionAnalysis: Schema.Schema<ThisExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('this'),
}).pipe(
  Schema.annotate({
    description: 'An expression analysis representing a reference to the current this value.',
  }),
)

export const SuperExpressionAnalysis: Schema.Schema<SuperExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('super'),
}).pipe(
  Schema.annotate({
    description: 'An expression analysis representing a reference to the current class superclass.',
  }),
)
