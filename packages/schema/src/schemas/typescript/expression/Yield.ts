import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Represents the analysis of a yield expression within a function body.
 */
export interface YieldExpressionAnalysis {
  /**
   * The expression kind, always set to 'yield'.
   */
  readonly kind: 'yield'

  /**
   * The optional expression yielded by the operation.
   */
  readonly expression?: ExpressionAnalysis | undefined
}

export const YieldExpressionAnalysis: Schema.Schema<YieldExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('yield'),
  expression: Schema.optional(Schema.suspend(() => ExpressionAnalysis)),
}).pipe(
  Schema.annotate({
    description: 'An element representing a yield operation within a function body.',
  }),
)
