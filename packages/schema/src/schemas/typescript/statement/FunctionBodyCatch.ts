import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyCatch extends FunctionBodyElementBase {
  readonly kind: 'catch'
  readonly variable?: FunctionBodyElement | undefined
  readonly statement: FunctionBodyElement
}

export const FunctionBodyCatch: Schema.Schema<FunctionBodyCatch> = Schema.Struct({
  kind: Schema.Literal('catch'),
  variable: Schema.optional(Schema.suspend(() => FunctionBodyElement)),
  statement: Schema.suspend(() => FunctionBodyElement),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a catch clause within a try statement.',
  }),
)
