import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

/**
 * An element representing a case branch within a switch statement.
 */
export interface FunctionBodySwitchCase extends FunctionBodyElementBase {
  /**
   * The literal discriminator value 'switch-case'.
   */
  readonly kind: 'switch-case'

  /**
   * The expression evaluated for this case branch.
   */
  readonly expression: ExpressionAnalysis

  /**
   * The body elements contained within this switch case branch.
   */
  readonly children: ReadonlyArray<FunctionBodyElement>
}

/**
 * An element representing default branch within a switch statement.
 */
export interface FunctionBodySwitchDefault extends FunctionBodyElementBase {
  /**
   * The literal discriminator value 'switch-default'.
   */
  readonly kind: 'switch-default'

  /**
   * The body elements contained within this switch default branch.
   */
  readonly children: ReadonlyArray<FunctionBodyElement>
}

/**
 * Represents either a switch case or switch default function body clause.
 */
export type FunctionBodySwitchClause = FunctionBodySwitchCase | FunctionBodySwitchDefault

/**
 * An element representing a case branch within a switch statement.
 */
export const FunctionBodySwitchCase: Schema.Schema<FunctionBodySwitchCase> = Schema.Struct({
  kind: Schema.Literal('switch-case'),
  expression: Schema.suspend(() => ExpressionAnalysis),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a case branch within a switch statement.',
  }),
)

/**
 * An element representing default branch within a switch statement.
 */
export const FunctionBodySwitchDefault: Schema.Schema<FunctionBodySwitchDefault> = Schema.Struct({
  kind: Schema.Literal('switch-default'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing default branch within a switch statement.',
  }),
)
