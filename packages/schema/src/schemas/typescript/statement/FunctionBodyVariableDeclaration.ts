import { Schema } from 'effect'
import { SymbolAnalysis } from '../SymbolAnalysis.js'
import { ExpressionAnalysis } from '../expression/ExpressionAnalysis.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

export interface FunctionBodyVariableDeclaration {
  readonly kind: 'variable-declaration'
  readonly symbol: SymbolAnalysis
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
