import { Schema } from 'effect'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export const FunctionBodyReturn = Schema.Struct({
  kind: Schema.Literal('return'),
  expression: Schema.optional(Schema.suspend(() => ExpressionAnalysis)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a return statement within a function body.',
  }),
)
