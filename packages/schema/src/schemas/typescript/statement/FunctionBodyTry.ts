import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'
import { FunctionBodyCatch } from './FunctionBodyCatch.js'

export interface FunctionBodyTry extends FunctionBodyElementBase {
  readonly kind: 'try'
  readonly statement: FunctionBodyElement
  readonly catch?: FunctionBodyCatch | undefined
  readonly finally?: FunctionBodyElement | undefined
}

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
