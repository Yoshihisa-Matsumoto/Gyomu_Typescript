import { Node } from 'ts-morph'
import { analyzeVariableStatement } from './analyzeVariableStatement.js'
import { analyzeClassStatement } from './analyzeClassStatement.js'
import { analyzeFunctionStatement } from './analyzeFunctionStatement.js'
import { analyzeInterfaceStatement } from './analyzeInterfaceStatement.js'
import { analyzeEnumStatement } from './analyzeEnumStatement.js'
import { analyzeTypeAliasStatement } from './analyzeTypeAliasStatement.js'
import type { Statement } from 'ts-morph'
import type { StatementAnalysisArgument, StatementAnalysisResult } from './types.js'

/**
 * Analyzes a TypeScript statement and returns its analysis result, or undefined if the statement type is not supported.
 *
 * @param statement The TypeScript statement node to analyze.
 *
 * @param args The arguments used for statement analysis.
 *
 * @returns The analysis result of the statement, or undefined if the statement kind is unhandled.
 */
export const analyzeStatement = (
  statement: Statement,
  args: StatementAnalysisArgument,
): StatementAnalysisResult | undefined => {
  if (Node.isVariableStatement(statement)) return analyzeVariableStatement(statement, args)
  if (Node.isClassDeclaration(statement)) return analyzeClassStatement(statement, args)
  if (Node.isFunctionDeclaration(statement)) return analyzeFunctionStatement(statement, args)
  if (Node.isInterfaceDeclaration(statement)) return analyzeInterfaceStatement(statement, args)
  if (Node.isEnumDeclaration(statement)) return analyzeEnumStatement(statement, args)
  if (Node.isTypeAliasDeclaration(statement)) return analyzeTypeAliasStatement(statement, args)

  return undefined
}
