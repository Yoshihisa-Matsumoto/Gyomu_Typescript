import { analyzeVariable } from '../variable/analyzeVariable.js'
import { analyzeStatement } from './analyzeStatement.js'
import type { CatchClause, TryStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyCatchClauseAnalysisResult,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'
import type { FunctionBodyElement } from '@gyomu/schema/schemas/typescript'

export const analyzeTryStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: TryStatement,
): FunctionBodyStatementAnalysisResult => {
  const catchClause = statement.getCatchClause()
  const finallyBlock = statement.getFinallyBlock()
  const tryStatement = analyzeStatement(args, statement.getTryBlock())
  const catchStatementResult = catchClause ? analyzeCatchStatement(args, catchClause) : undefined
  const finallyStatementResult = finallyBlock ? analyzeStatement(args, finallyBlock) : undefined

  return {
    dependencies: [
      ...tryStatement.dependencies,
      ...(catchStatementResult?.dependencies ?? []),
      ...(finallyStatementResult?.dependencies ?? []),
    ],
    reservedNames: [
      ...tryStatement.reservedNames,
      ...(catchStatementResult?.reservedNames ?? []),
      ...(finallyStatementResult?.reservedNames ?? []),
    ],
    elements: [
      {
        kind: 'try',
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        statement: tryStatement.elements[0]!,
        catch: catchStatementResult?.element,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        finally: finallyStatementResult ? finallyStatementResult.elements[0]! : undefined,
      },
    ],
  }
}

const analyzeCatchStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: CatchClause,
): FunctionBodyCatchClauseAnalysisResult => {
  const variable = statement.getVariableDeclaration()
  const variableResult = variable ? analyzeVariable({ ...args, declaration: variable }) : undefined
  const variableElement: FunctionBodyElement | undefined = variableResult?.symbol
    ? { kind: 'variable-declaration', symbol: variableResult.symbol }
    : undefined
  const statementResult = analyzeStatement(args, statement.getBlock())
  return {
    element: {
      kind: 'catch',
      variable: variableElement,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      statement: statementResult.elements[0]!,
    },
    dependencies: [
      ...(variableResult?.symbol.dependencyCandidates ?? []),
      ...statementResult.dependencies,
    ],
    reservedNames: statementResult.reservedNames,
  }
}
