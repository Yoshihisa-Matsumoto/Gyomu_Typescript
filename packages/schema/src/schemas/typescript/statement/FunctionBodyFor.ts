import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyFor extends FunctionBodyElementBase {
  readonly kind: 'for'
  readonly children: ReadonlyArray<FunctionBodyElement>
}

export const FunctionBodyFor: Schema.Schema<FunctionBodyFor> = Schema.Struct({
  kind: Schema.Literal('for'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a for loop within a function body.',
  }),
)
