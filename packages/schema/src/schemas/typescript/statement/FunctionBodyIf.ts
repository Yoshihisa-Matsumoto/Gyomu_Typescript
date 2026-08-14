import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyIf extends FunctionBodyElementBase {
  readonly kind: 'if'
  readonly expression: ExpressionAnalysis
  readonly then: FunctionBodyElement
  readonly else?: FunctionBodyElement | undefined
}

export const FunctionBodyIf: Schema.Schema<FunctionBodyIf> = Schema.Struct({
  kind: Schema.Literal('if'),
  expression: Schema.suspend(() => ExpressionAnalysis),
  then: Schema.suspend(() => FunctionBodyElement),
  else: Schema.optional(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description:
      'An element representing an if statement and its conditional branches within a function body.',
  }),
)
