import { Schema } from 'effect'

/**
 * An expression analysis representing an identifier reference.
 */
export interface IdentifierExpressionAnalysis {
  /**
   * The literal discriminator for an identifier expression analysis.
   */
  readonly kind: 'identifier'

  /**
   * The name of the referenced identifier.
   */
  readonly name: string
}

/**
 * An expression analysis representing an identifier reference.
 */
export const IdentifierExpressionAnalysis: Schema.Schema<IdentifierExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('identifier'),
    name: Schema.String,
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an identifier reference.',
    }),
  )
