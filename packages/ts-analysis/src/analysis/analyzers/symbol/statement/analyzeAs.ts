import { analyzeType } from '../type/analyzeType.js'
import { analyzeExpression } from './analyzeExpression.js'
import type { AsExpression, Expression } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeAsExpression = (
  args: ChildAnalysisArg<FunctionLikeNodeType | Expression>,
  expression: AsExpression,
): ExpressionAnalysisResult => {
  const expressionResult = analyzeExpression({ ...args, node: expression.getExpression() })
  const typeResult = analyzeType({ ...args, node: expression.getTypeNode()! }, undefined, undefined)

  return {
    dependencies: [...expressionResult.dependencies, ...typeResult.dependencies],
    reservedNames: [...expressionResult.reservedNames, ...typeResult.reservedNames],
    element: {
      kind: 'as',
      expression: expressionResult.element,
      type: typeResult.member,
    },
  }
}
