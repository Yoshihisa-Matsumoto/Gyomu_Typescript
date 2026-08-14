import { Schema } from 'effect'

export type FunctionBodyElementBase = object

export const FunctionBodyElementBase = Schema.Struct({})

export interface FunctionBodyBreak extends FunctionBodyElementBase {
  readonly kind: 'break'
}

export const FunctionBodyBreak: Schema.Schema<FunctionBodyBreak> = Schema.Struct({
  kind: Schema.Literal('break'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a break statement within a function body.',
  }),
)

export interface FunctionBodyContinue extends FunctionBodyElementBase {
  readonly kind: 'continue'
}

export const FunctionBodyContinue: Schema.Schema<FunctionBodyContinue> = Schema.Struct({
  kind: Schema.Literal('continue'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a continue statement within a function body.',
  }),
)
