import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export interface PropertyAccessExpressionAnalysis {
  readonly kind: 'property-access'
  readonly object: ExpressionAnalysis
  readonly property: string
  readonly optional: boolean
}

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
