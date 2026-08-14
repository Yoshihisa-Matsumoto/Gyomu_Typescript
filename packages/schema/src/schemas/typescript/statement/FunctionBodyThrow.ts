import { Schema } from 'effect'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

/**
 * An element representing a throw statement within a function body, containing a throw kind literal and an expression.
 */
export const FunctionBodyThrow = Schema.Struct({
  kind: Schema.Literal('throw'),
  expression: Schema.suspend(() => ExpressionAnalysis),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a throw statement within a function body.',
  }),
)
