import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyBlock extends FunctionBodyElementBase {
  readonly kind: 'block'
  readonly children: ReadonlyArray<FunctionBodyElement>
}

export const FunctionBodyBlock: Schema.Schema<FunctionBodyBlock> = Schema.Struct({
  kind: Schema.Literal('block'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a block statement within a function body.',
  }),
)
