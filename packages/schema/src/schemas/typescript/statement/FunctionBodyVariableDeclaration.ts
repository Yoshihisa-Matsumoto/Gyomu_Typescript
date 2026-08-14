import { Schema } from 'effect'
import { SymbolAnalysis } from '../SymbolAnalysis.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

/**
 * Represents a variable declaration within a function body, containing the symbol analysis and an optional initializer expression.
 */
export interface FunctionBodyVariableDeclaration {
  /**
   * The discriminant kind of the variable declaration.
   */
  readonly kind: 'variable-declaration'

  /**
   * The symbol analysis associated with the declared variable.
   */
  readonly symbol: SymbolAnalysis

  /**
   * The optional initializer expression for the variable declaration.
   */
  readonly initializer?: ExpressionAnalysis | undefined
}

export const FunctionBodyVariableDeclaration: Schema.Schema<FunctionBodyVariableDeclaration> =
  Schema.Struct({
    kind: Schema.Literal('variable-declaration'),
    symbol: Schema.suspend(() => SymbolAnalysis),
    initializer: Schema.optional(Schema.suspend(() => ExpressionAnalysis)),
  }).pipe(
    Schema.fieldsAssign(FunctionBodyElementBase.fields),
    Schema.annotate({
      description: 'An element representing a variable declaration within a function body.',
    }),
  )
