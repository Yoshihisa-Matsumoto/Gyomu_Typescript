import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

/**
 * Represents an if statement and its conditional branches within a function body.
 */
export interface FunctionBodyIf extends FunctionBodyElementBase {
  /**
   * The literal discriminant for the if statement element.
   */
  readonly kind: 'if'

  /**
   * The expression analysis for the conditional check.
   */
  readonly expression: ExpressionAnalysis

  /**
   * The body element executed when the condition evaluates to true.
   */
  readonly then: FunctionBodyElement

  /**
   * The optional body element executed when the condition evaluates to false.
   */
  readonly else?: FunctionBodyElement | undefined
}

/**
 * Schema defining an if statement and its conditional branches within a function body, including the condition expression, then branch, and optional else branch.
 */
export const FunctionBodyIf: Schema.Schema<FunctionBodyIf> = Schema.Struct({
  kind: Schema.Literal('if'),
  expression: Schema.suspend(() => ExpressionAnalysis),
  then: Schema.suspend(() => FunctionBodyElement),
  else: Schema.optional(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description:
      'An element representing an if statement and its conditional branches within a function body.',
  }),
)
