import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodySwitchCase extends FunctionBodyElementBase {
  readonly kind: 'switch-case'
  readonly children: ReadonlyArray<FunctionBodyElement>
}

export const FunctionBodySwitchCase: Schema.Schema<FunctionBodySwitchCase> = Schema.Struct({
  kind: Schema.Literal('switch-case'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a case or default branch within a switch statement.',
  }),
)
