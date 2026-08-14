import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

/**
 * Represents a catch clause within a try statement, defining an optional exception variable and the statement body.
 */
export interface FunctionBodyCatch extends FunctionBodyElementBase {
  /**
   * The literal discriminator for the catch element.
   */
  readonly kind: 'catch'

  /**
   * The optional variable binding for the catch clause.
   */
  readonly variable?: FunctionBodyElement | undefined

  /**
   * The statement element to execute within the catch clause.
   */
  readonly statement: FunctionBodyElement
}

/**
 * An element representing a catch clause within a try statement.
 */
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
