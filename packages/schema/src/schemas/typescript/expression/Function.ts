import { Schema } from 'effect'
import { NonDocumentableMethodMemberAnalysis } from '../member/NonDocumentableMethodMemberAnalysis.js'
import { DocumentableMethodMemberAnalysis } from '../member/DocumentableMethodMemberAnalysis.js'

export interface FunctionExpressionAnalysis {
  readonly kind: 'function-expression'
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
