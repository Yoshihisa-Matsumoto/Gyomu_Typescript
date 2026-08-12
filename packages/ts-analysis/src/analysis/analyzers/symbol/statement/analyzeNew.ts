import { Node } from 'ts-morph'
import { analyzeExpression } from './analyzeExpression.js'
import type { Expression, NewExpression } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeNewExpression = (
  args: ChildAnalysisArg<FunctionLikeNodeType | Expression>,
  call: NewExpression,
): ExpressionAnalysisResult => {
  const expressionResult = analyzeExpression({ ...args, node: call.getExpression() })
  const argumentsResult = call
    .getArguments()
    .map((arg) => {
      if (Node.isExpression(arg)) return analyzeExpression({ ...args, node: arg })
      return undefined
    })
    .filter((e) => !!e)

  return {
    dependencies: [
      ...expressionResult.dependencies,
      ...argumentsResult.map((a) => a.dependencies).flat(),
    ],
    reservedNames: [
      ...expressionResult.reservedNames,
      ...argumentsResult.map((a) => a.reservedNames).flat(),
    ],
    element: {
      kind: 'new',
      callee: expressionResult.element,
      arguments: argumentsResult.map((a) => a.element),
    },
  }
}
