import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyWhile extends FunctionBodyElementBase {
  readonly kind: 'while'
  readonly children: ReadonlyArray<FunctionBodyElement>
}

export const FunctionBodyWhile: Schema.Schema<FunctionBodyWhile> = Schema.Struct({
  kind: Schema.Literal('while'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a while loop within a function body.',
  }),
)
