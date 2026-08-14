import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyWhile extends FunctionBodyElementBase {
  readonly kind: 'while'
  readonly expression: ExpressionAnalysis
  readonly statement: FunctionBodyElement
}

export const FunctionBodyWhile: Schema.Schema<FunctionBodyWhile> = Schema.Struct({
  kind: Schema.Literal('while'),
  expression: Schema.suspend(() => ExpressionAnalysis),
  statement: Schema.suspend(() => FunctionBodyElement),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a while loop within a function body.',
  }),
)
