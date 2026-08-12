import { analyzeExpression } from './analyzeExpression.js'
import type { ReturnStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeReturnExpression = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: ReturnStatement,
): FunctionBodyStatementAnalysisResult => {
  const target = statement.getExpression()
  const expressionResult = target ? analyzeExpression({ ...args, node: target }) : undefined

  return {
    dependencies: expressionResult?.dependencies ?? [],
    reservedNames: expressionResult?.reservedNames ?? [],
    element: {
      kind: 'return',
      expression: expressionResult?.element,
    },
  }
}
