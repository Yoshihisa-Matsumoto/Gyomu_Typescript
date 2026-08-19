import { Schema } from 'effect'
import { NonDocumentableMethodMemberAnalysis } from '../member/NonDocumentableMethodMemberAnalysis.js'
import { DocumentableMethodMemberAnalysis } from '../member/DocumentableMethodMemberAnalysis.js'

/**
 * An analysis representing an inline function expression, including arrow functions.
 */
export interface FunctionExpressionAnalysis {
  /**
   * Discriminant property indicating a function expression analysis.
   */
  readonly kind: 'function-expression'

  /**
   * The underlying method member analysis for the function.
   */
  readonly function: NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis
}

export const FunctionExpressionAnalysis: Schema.Schema<FunctionExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('function-expression'),
  function: Schema.Union([
    Schema.suspend(() => NonDocumentableMethodMemberAnalysis),
    Schema.suspend(() => DocumentableMethodMemberAnalysis),
  ]),
}).pipe(
  Schema.annotate({
    description:
      'An expression analysis representing an inline function expression, including arrow functions.',
  }),
)
