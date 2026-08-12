import { Schema } from 'effect'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export const FunctionBodyTry = Schema.Struct({
  kind: Schema.Literal('try'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description:
      'An element representing a try statement and its exception-handling branches within a function body.',
  }),
)
