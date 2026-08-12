import { Schema } from 'effect'

export interface IdentifierExpressionAnalysis {
  readonly kind: 'identifier'
  readonly name: string
}

export const IdentifierExpressionAnalysis: Schema.Schema<IdentifierExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('identifier'),
    name: Schema.String,
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an identifier reference.',
    }),
  )
