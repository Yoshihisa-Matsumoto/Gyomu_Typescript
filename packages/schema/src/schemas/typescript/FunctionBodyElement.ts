import { Schema } from 'effect'
// import { FunctionBodyExpression } from './statement/FunctionBodyExpression.js'
import { FunctionBodyVariableDeclaration } from './statement/FunctionBodyVariableDeclaration.js'
import { FunctionBodyReturn } from './statement/FunctionBodyReturn.js'
import { FunctionBodyThrow } from './statement/FunctionBodyThrow.js'
import { FunctionBodyAwait } from './statement/FunctionBodyAwait.js'
import { FunctionBodyIf } from './statement/FunctionBodyIf.js'
import { FunctionBodySwitch } from './statement/FunctionBodySwitch.js'
import { FunctionBodyFor } from './statement/FunctionBodyFor.js'
import { FunctionBodyWhile } from './statement/FunctionBodyWhile.js'
import { FunctionBodyTry } from './statement/FunctionBodyTry.js'
import { ExpressionAnalysis } from './expression/ExpressionAnalysis.js'

export const FunctionBodyElement = Schema.Union([
  ExpressionAnalysis,
  // FunctionBodyExpression,
  FunctionBodyVariableDeclaration,
  FunctionBodyReturn,
  FunctionBodyThrow,
  FunctionBodyAwait,
  FunctionBodyIf,
  FunctionBodySwitch,
  FunctionBodyFor,
  FunctionBodyWhile,
  FunctionBodyTry,
]).annotate({
  description: 'An element representing a structural or behavioral aspect of a function body.',
})

export type FunctionBodyElement = Schema.Schema.Type<typeof FunctionBodyElement>
