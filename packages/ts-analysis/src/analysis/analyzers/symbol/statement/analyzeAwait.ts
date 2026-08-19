import { analyzeExpression } from './analyzeExpression.js'
import type { AwaitExpression, Expression } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeAwaitExpression = (
  args: ChildAnalysisArg<FunctionLikeNodeType | Expression>,
  expression: AwaitExpression,
): ExpressionAnalysisResult => {
  const expressionResult = analyzeExpression({ ...args, node: expression.getExpression() })

  return {
    dependencies: [...expressionResult.dependencies],
    reservedNames: [...expressionResult.reservedNames],
    element: {
      kind: 'await',
      expression: expressionResult.element,
    },
  }
}
