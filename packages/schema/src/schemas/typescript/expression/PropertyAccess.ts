import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * An expression analysis representing access to a named property of an object.
 */
export interface PropertyAccessExpressionAnalysis {
  /**
   * Discriminates the expression analysis type as property-access.
   */
  readonly kind: 'property-access'

  /**
   * The target object expression being accessed.
   */
  readonly object: ExpressionAnalysis

  /**
   * The name of the property being accessed.
   */
  readonly property: string

  /**
   * Indicates whether the property access is optional.
   */
  readonly optional: boolean
}

/**
 * An expression analysis schema representing access to a named property of an object.
 */
export const PropertyAccessExpressionAnalysis: Schema.Schema<PropertyAccessExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('property-access'),
    object: Schema.suspend(() => ExpressionAnalysis),
    property: Schema.String,
    optional: Schema.Boolean,
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing access to a named property of an object.',
    }),
  )
