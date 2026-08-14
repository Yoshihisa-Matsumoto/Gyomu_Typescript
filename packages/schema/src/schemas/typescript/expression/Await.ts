import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Represents an analyzed await expression containing the await kind and the evaluated expression.
 */
export interface AwaitExpressionAnalysis {
  /**
   * The literal kind discriminator for an await expression.
   */
  readonly kind: 'await'

  /**
   * The expression analysis associated with the await operation.
   */
  readonly expression: ExpressionAnalysis
}

/**
 * An element representing an asynchronous operation using the await operator within a function body.
 */
export const AwaitExpressionAnalysis: Schema.Schema<AwaitExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('await'),
  expression: Schema.suspend(() => ExpressionAnalysis),
}).pipe(
  Schema.annotate({
    description:
      'An element representing an asynchronous operation using the await operator within a function body.',
  }),
)
