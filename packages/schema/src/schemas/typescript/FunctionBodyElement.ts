import { Schema } from 'effect'
// import { FunctionBodyExpression } from './statement/FunctionBodyExpression.js'
import { FunctionBodyVariableDeclaration } from './statement/FunctionBodyVariableDeclaration.js'
import { FunctionBodyReturn } from './statement/FunctionBodyReturn.js'
import { FunctionBodyThrow } from './statement/FunctionBodyThrow.js'
import { FunctionBodyIf } from './statement/FunctionBodyIf.js'
import { FunctionBodySwitch } from './statement/FunctionBodySwitch.js'
import { FunctionBodyFor } from './statement/FunctionBodyFor.js'
import { FunctionBodyWhile } from './statement/FunctionBodyWhile.js'
import { FunctionBodyTry } from './statement/FunctionBodyTry.js'
import { ExpressionAnalysis } from './expression/ExpressionAnalysis.js'
import { FunctionBodyBlock } from './statement/FunctionBodyBlock.js'
import { FunctionBodyBreak, FunctionBodyContinue } from './statement/FunctionBodyElementBase.js'
import { FunctionBodyExpression } from './statement/FunctionBodyExpression.js'

export const FunctionBodyElement = Schema.Union([
  ExpressionAnalysis,
  // FunctionBodyExpression,
  FunctionBodyVariableDeclaration,
  FunctionBodyReturn,
  FunctionBodyThrow,
  FunctionBodyIf,
  FunctionBodySwitch,
  FunctionBodyFor,
  FunctionBodyWhile,
  FunctionBodyTry,
  FunctionBodyBlock,
  FunctionBodyBreak,
  FunctionBodyContinue,
  FunctionBodyExpression,
]).annotate({
  description: 'An element representing a structural or behavioral aspect of a function body.',
})

/**
 * Represents the TypeScript type for FunctionBodyElement derived from its schema definition.
 */
export type FunctionBodyElement = Schema.Schema.Type<typeof FunctionBodyElement>
