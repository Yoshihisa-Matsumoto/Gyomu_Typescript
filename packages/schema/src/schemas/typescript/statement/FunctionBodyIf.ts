import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyIf extends FunctionBodyElementBase {
  readonly kind: 'if'
  readonly children: ReadonlyArray<FunctionBodyElement>
}

export const FunctionBodyIf: Schema.Schema<FunctionBodyIf> = Schema.Struct({
  kind: Schema.Literal('if'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description:
      'An element representing an if statement and its conditional branches within a function body.',
  }),
)
