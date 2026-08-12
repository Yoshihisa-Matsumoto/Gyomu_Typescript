import { Schema } from 'effect'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export const FunctionBodyCatch = Schema.Struct({
  kind: Schema.Literal('catch'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a catch clause within a try statement.',
  }),
)
