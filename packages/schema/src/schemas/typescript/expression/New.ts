import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * An element representing an object construction using the new operator within a function body.
 */
export interface NewExpressionAnalysis {
  /**
   * Discriminator property representing a new expression ('new').
   */
  readonly kind: 'new'

  /**
   * The expression being invoked as a constructor.
   */
  readonly callee: ExpressionAnalysis

  /**
   * The arguments passed to the constructor.
   */
  readonly arguments: ReadonlyArray<ExpressionAnalysis>
}

/**
 * An element representing an object construction using the new operator within a function body.
 */
export const NewExpressionAnalysis: Schema.Schema<NewExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('new'),
  callee: Schema.suspend(() => ExpressionAnalysis),
  arguments: Schema.Array(Schema.suspend(() => ExpressionAnalysis)),
}).pipe(
  Schema.annotate({
    description:
      'An element representing an object construction using the new operator within a function body.',
  }),
)
