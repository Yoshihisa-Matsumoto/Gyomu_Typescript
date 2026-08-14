import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyFor extends FunctionBodyElementBase {
  readonly kind: 'for'
  readonly expression?: ExpressionAnalysis | undefined
  readonly initializer: ReadonlyArray<FunctionBodyElement>
  readonly incrementor?: ExpressionAnalysis | undefined
  readonly statement: FunctionBodyElement
  readonly isAwait: boolean
}

export const FunctionBodyFor: Schema.Schema<FunctionBodyFor> = Schema.Struct({
  kind: Schema.Literal('for'),
  expression: Schema.optional(Schema.suspend(() => ExpressionAnalysis)),
  initializer: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
  incrementor: Schema.optional(Schema.suspend(() => ExpressionAnalysis)),
  statement: Schema.suspend(() => FunctionBodyElement),
  isAwait: Schema.Boolean,
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a for loop within a function body.',
  }),
)
