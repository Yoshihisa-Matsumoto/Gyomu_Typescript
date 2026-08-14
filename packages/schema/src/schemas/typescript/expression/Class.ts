import { Schema } from 'effect'

/**
 * An expression analysis representing a reference to the current this value.
 */
export interface ThisExpressionAnalysis {
  /**
   * The expression kind discriminator, always set to 'this'.
   */
  readonly kind: 'this'
}

/**
 * An expression analysis representing a reference to the current class superclass.
 */
export interface SuperExpressionAnalysis {
  /**
   * The expression kind discriminator, always set to 'super'.
   */
  readonly kind: 'super'
}

/**
 * An expression analysis representing a reference to the current this value.
 */
export const ThisExpressionAnalysis: Schema.Schema<ThisExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('this'),
}).pipe(
  Schema.annotate({
    description: 'An expression analysis representing a reference to the current this value.',
  }),
)

/**
 * An expression analysis representing a reference to the current class superclass.
 */
export const SuperExpressionAnalysis: Schema.Schema<SuperExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('super'),
}).pipe(
  Schema.annotate({
    description: 'An expression analysis representing a reference to the current class superclass.',
  }),
)
