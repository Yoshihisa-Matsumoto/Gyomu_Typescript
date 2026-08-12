import { Schema } from 'effect'

export interface LogicalAndExpressionAnalysis {
  readonly kind: 'and'
}

export const LogicalAndExpressionAnalysis: Schema.Schema<LogicalAndExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('and'),
  }).pipe(
    Schema.annotate({
      description: 'An element representing a logical AND operation within a function body.',
    }),
  )

export interface LogicalOrExpressionAnalysis {
  readonly kind: 'or'
}

export const LogicalOrExpressionAnalysis: Schema.Schema<LogicalOrExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('or'),
  }).pipe(
    Schema.annotate({
      description: 'An element representing a logical OR operation within a function body.',
    }),
  )
