import { Schema } from 'effect'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export const FunctionBodyVariableDeclaration = Schema.Struct({
  kind: Schema.Literal('variable-declaration'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a variable declaration within a function body.',
  }),
)
