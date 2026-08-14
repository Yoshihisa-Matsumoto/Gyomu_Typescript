import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

/**
 * Represents a while loop element within a function body, containing an expression and a statement.
 */
export interface FunctionBodyWhile extends FunctionBodyElementBase {
  /**
   * The literal kind discriminator for a while loop element.
   */
  readonly kind: 'while'

  /**
   * The condition expression analysis for the while loop.
   */
  readonly expression: ExpressionAnalysis

  /**
   * The statement executed in the body of the while loop.
   */
  readonly statement: FunctionBodyElement
}

/**
 * An element representing a while loop within a function body, containing an expression analysis and a nested statement.
 */
export const FunctionBodyWhile: Schema.Schema<FunctionBodyWhile> = Schema.Struct({
  kind: Schema.Literal('while'),
  expression: Schema.suspend(() => ExpressionAnalysis),
  statement: Schema.suspend(() => FunctionBodyElement),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a while loop within a function body.',
  }),
)
