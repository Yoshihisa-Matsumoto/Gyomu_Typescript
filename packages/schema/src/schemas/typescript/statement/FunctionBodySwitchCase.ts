import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodySwitchCase extends FunctionBodyElementBase {
  readonly kind: 'switch-case'
  readonly expression: ExpressionAnalysis
  readonly children: ReadonlyArray<FunctionBodyElement>
}

export interface FunctionBodySwitchDefault extends FunctionBodyElementBase {
  readonly kind: 'switch-default'
  readonly children: ReadonlyArray<FunctionBodyElement>
}

export type FunctionBodySwitchClause = FunctionBodySwitchCase | FunctionBodySwitchDefault

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

export const FunctionBodySwitchDefault: Schema.Schema<FunctionBodySwitchDefault> = Schema.Struct({
  kind: Schema.Literal('switch-default'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing default branch within a switch statement.',
  }),
)
