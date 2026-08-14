import { Schema } from 'effect'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'
import { FunctionBodySwitchCase, FunctionBodySwitchDefault } from './FunctionBodySwitchCase.js'
import type { FunctionBodySwitchClause } from './FunctionBodySwitchCase.js'

/**
 * Represents a switch statement element within a function body, consisting of a switch expression and clause children.
 */
export interface FunctionBodySwitch extends FunctionBodyElementBase {
  /**
   * Discriminator property set to the literal 'switch'.
   */
  readonly kind: 'switch'

  /**
   * The expression analyzed for the switch statement.
   */
  readonly expression: ExpressionAnalysis

  /**
   * The clauses contained within the switch statement.
   */
  readonly children: ReadonlyArray<FunctionBodySwitchClause>
}

/**
 * Schema definition for an element representing a switch statement and its cases within a function body.
 */
export const FunctionBodySwitch: Schema.Schema<FunctionBodySwitch> = Schema.Struct({
  kind: Schema.Literal('switch'),
  expression: Schema.suspend(() => ExpressionAnalysis),
  children: Schema.Array(
    Schema.Union([
      Schema.suspend(() => FunctionBodySwitchCase),
      Schema.suspend(() => FunctionBodySwitchDefault),
    ]),
  ),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a switch statement and its cases within a function body.',
  }),
)
