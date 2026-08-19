import { Node } from 'ts-morph'
import { analyzeExpression } from './analyzeExpression.js'
import type { CallExpression, Expression } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeCallExpression = (
  args: ChildAnalysisArg<FunctionLikeNodeType | Expression>,
  call: CallExpression,
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
    element: {
      kind: 'call',
      callee: expressionResult.element,
      arguments: argumentsResult.map((a) => a.element),
      optional: call.getQuestionDotTokenNode() ? true : false,
    },
    reservedNames: [
      ...expressionResult.reservedNames,
      ...argumentsResult.map((a) => a.reservedNames).flat(),
    ],
  }
}
