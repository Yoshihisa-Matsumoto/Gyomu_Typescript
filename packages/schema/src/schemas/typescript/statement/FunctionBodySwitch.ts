import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodySwitch extends FunctionBodyElementBase {
  readonly kind: 'switch'
  readonly children: ReadonlyArray<FunctionBodyElement>
}
export const FunctionBodySwitch: Schema.Schema<FunctionBodySwitch> = Schema.Struct({
  kind: Schema.Literal('switch'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a switch statement and its cases within a function body.',
  }),
)
