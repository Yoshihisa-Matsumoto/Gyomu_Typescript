import { Schema } from 'effect'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export const FunctionBodyExpression = Schema.Struct({
  kind: Schema.Literal('expression-statement'),
  expression: Schema.suspend(() => ExpressionAnalysis),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a expression statement within a function body.',
  }),
)
