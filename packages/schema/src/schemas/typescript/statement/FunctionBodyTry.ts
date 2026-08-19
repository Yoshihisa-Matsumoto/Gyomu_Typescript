import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'
import { FunctionBodyCatch } from './FunctionBodyCatch.js'

/**
 * Represents a try statement and its exception-handling branches within a function body.
 */
export interface FunctionBodyTry extends FunctionBodyElementBase {
  /**
   * The literal kind discriminator for a try statement.
   */
  readonly kind: 'try'

  /**
   * The statement executed within the try block.
   */
  readonly statement: FunctionBodyElement

  /**
   * The optional catch block handling exceptions thrown in the try block.
   */
  readonly catch?: FunctionBodyCatch | undefined

  /**
   * The optional finally block executed after the try and catch blocks.
   */
  readonly finally?: FunctionBodyElement | undefined
}

/**
 * Schema for an element representing a try statement and its exception-handling branches within a function body.
 */
export const FunctionBodyTry: Schema.Schema<FunctionBodyTry> = Schema.Struct({
  kind: Schema.Literal('try'),
  statement: Schema.suspend(() => FunctionBodyElement),
  catch: Schema.optional(Schema.suspend(() => FunctionBodyCatch)),
  finally: Schema.optional(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description:
      'An element representing a try statement and its exception-handling branches within a function body.',
  }),
)
