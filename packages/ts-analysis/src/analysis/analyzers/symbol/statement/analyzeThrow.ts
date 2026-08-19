import { analyzeExpression } from './analyzeExpression.js'
import type { ThrowStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeThrowStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: ThrowStatement,
): FunctionBodyStatementAnalysisResult => {
  const target = statement.getExpression()
  const expressionResult = analyzeExpression({ ...args, node: target })

  return {
    dependencies: expressionResult.dependencies,
    reservedNames: expressionResult.reservedNames,
    elements: [
      {
        kind: 'throw',
        expression: expressionResult.element,
      },
    ],
  }
}
