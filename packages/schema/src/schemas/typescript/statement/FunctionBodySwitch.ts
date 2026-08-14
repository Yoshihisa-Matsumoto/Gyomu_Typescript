import { Schema } from 'effect'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'
import { FunctionBodySwitchCase, FunctionBodySwitchDefault } from './FunctionBodySwitchCase.js'
import type { FunctionBodySwitchClause } from './FunctionBodySwitchCase.js'

export interface FunctionBodySwitch extends FunctionBodyElementBase {
  readonly kind: 'switch'
  readonly expression: ExpressionAnalysis
  readonly children: ReadonlyArray<FunctionBodySwitchClause>
}
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
