import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Represents a function or method call expression, including its callee, arguments, and optional invocation flag.
 */
export interface CallExpressionAnalysis {
  /**
   * Discriminator property indicating the expression kind, always set to 'call'.
   */
  readonly kind: 'call'

  /**
   * The expression being invoked as a function or method.
   */
  readonly callee: ExpressionAnalysis

  /**
   * The list of arguments passed to the call.
   */
  readonly arguments: ReadonlyArray<ExpressionAnalysis>

  /**
   * Indicates whether the call is optional (e.g., optional chaining).
   */
  readonly optional: boolean
}

/**
 * An expression analysis representing a function or method call and its invocation arguments.
 */
export const CallExpressionAnalysis: Schema.Schema<CallExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('call'),
  callee: Schema.suspend(() => ExpressionAnalysis),
  arguments: Schema.Array(Schema.suspend(() => ExpressionAnalysis)),
  optional: Schema.Boolean,
}).pipe(
  Schema.annotate({
    description:
      'An expression analysis representing a function or method call and its invocation arguments.',
  }),
)
