import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Represents the analysis of a computed property access expression.
 */
export interface ComputedAccessExpressionAnalysis {
  /**
   * The expression analysis kind identifier.
   */
  readonly kind: 'computed-access'

  /**
   * The expression being accessed.
   */
  readonly object: ExpressionAnalysis

  /**
   * The computed index expression used for access.
   */
  readonly index: ExpressionAnalysis

  /**
   * Indicates whether the access is optional.
   */
  readonly optional: boolean
}

/**
 * An expression analysis representing access to an object property using a computed index expression, containing kind, object, index, and optional fields.
 */
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
