import { Schema } from 'effect'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export const FunctionBodyThrow = Schema.Struct({
  kind: Schema.Literal('throw'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a throw statement within a function body.',
  }),
)
