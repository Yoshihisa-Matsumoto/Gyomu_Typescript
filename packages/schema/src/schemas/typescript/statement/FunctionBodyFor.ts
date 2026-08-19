import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

/**
 * Represents a for loop statement within a function body.
 */
export interface FunctionBodyFor extends FunctionBodyElementBase {
  /**
   * Discriminator property indicating a for loop element.
   */
  readonly kind: 'for'

  /**
   * Optional expression analyzed for the for loop condition.
   */
  readonly expression?: ExpressionAnalysis | undefined

  /**
   * Initializer elements evaluated before the for loop starts.
   */
  readonly initializer: ReadonlyArray<FunctionBodyElement>

  /**
   * Optional incrementor expression evaluated after each loop iteration.
   */
  readonly incrementor?: ExpressionAnalysis | undefined

  /**
   * The body statement executed in each iteration of the for loop.
   */
  readonly statement: FunctionBodyElement

  /**
   * Indicates whether the for loop is an asynchronous for-await loop.
   */
  readonly isAwait: boolean
}

export const FunctionBodyFor: Schema.Schema<FunctionBodyFor> = Schema.Struct({
  kind: Schema.Literal('for'),
  expression: Schema.optional(Schema.suspend(() => ExpressionAnalysis)),
  initializer: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
  incrementor: Schema.optional(Schema.suspend(() => ExpressionAnalysis)),
  statement: Schema.suspend(() => FunctionBodyElement),
  isAwait: Schema.Boolean,
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a for loop within a function body.',
  }),
)
