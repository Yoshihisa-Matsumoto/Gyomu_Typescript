import { Schema } from 'effect'

/**
 * Base type for function body elements.
 */
export type FunctionBodyElementBase = object

/**
 * Base schema for function body elements.
 */
export const FunctionBodyElementBase = Schema.Struct({})

/**
 * Represents a break statement within a function body.
 */
export interface FunctionBodyBreak extends FunctionBodyElementBase {
  /**
   * The literal discriminator for a break statement.
   */
  readonly kind: 'break'
}

/**
 * Schema for an element representing a break statement within a function body.
 */
export const FunctionBodyBreak: Schema.Schema<FunctionBodyBreak> = Schema.Struct({
  kind: Schema.Literal('break'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a break statement within a function body.',
  }),
)

/**
 * Represents a continue statement within a function body.
 */
export interface FunctionBodyContinue extends FunctionBodyElementBase {
  /**
   * The literal discriminator for a continue statement.
   */
  readonly kind: 'continue'
}

/**
 * Schema for an element representing a continue statement within a function body.
 */
export const FunctionBodyContinue: Schema.Schema<FunctionBodyContinue> = Schema.Struct({
  kind: Schema.Literal('continue'),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a continue statement within a function body.',
  }),
)
