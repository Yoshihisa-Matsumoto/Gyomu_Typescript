import { Schema } from 'effect'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export const FunctionBodyAwait = Schema.Struct({
  kind: Schema.Literal('await'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing an await expression within a function body.',
  }),
)
