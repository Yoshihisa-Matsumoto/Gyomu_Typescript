import { analyzeExpression } from './analyzeExpression.js'
import type { Expression, TypeOfExpression } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeTypeOfExpression = (
  args: ChildAnalysisArg<FunctionLikeNodeType | Expression>,
  expression: TypeOfExpression,
): ExpressionAnalysisResult => {
  const expressionResult = analyzeExpression({ ...args, node: expression.getExpression() })

  return {
    dependencies: [...expressionResult.dependencies],
    reservedNames: [...expressionResult.reservedNames],
    element: {
      kind: 'typeof',
      expression: expressionResult.element,
    },
  }
}
