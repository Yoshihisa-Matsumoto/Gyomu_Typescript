import { analyzeExpression } from './analyzeExpression.js'
import { analyzeStatement } from './analyzeStatement.js'
import type { IfStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeIfStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: IfStatement,
): FunctionBodyStatementAnalysisResult => {
  const expressionResult = analyzeExpression({ ...args, node: statement.getExpression() })
  const thenStatement = analyzeStatement(args, statement.getThenStatement())
  const elseStatementResult = statement.getElseStatement()
    ? analyzeStatement(args, statement.getElseStatement()!)
    : undefined

  return {
    dependencies: [
      ...expressionResult.dependencies,
      ...thenStatement.dependencies,
      ...(elseStatementResult?.dependencies ?? []),
    ],
    reservedNames: [
      ...expressionResult.reservedNames,
      ...thenStatement.reservedNames,
      ...(elseStatementResult?.reservedNames ?? []),
    ],
    elements: [
      {
        kind: 'if',
        expression: expressionResult.element,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        then: thenStatement.elements[0]!,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        else: elseStatementResult ? elseStatementResult.elements[0]! : undefined,
      },
    ],
  }
}
