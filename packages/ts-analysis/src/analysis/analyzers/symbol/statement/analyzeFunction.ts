import { analyzeFunctionMember } from '../struct/analyzeFunctionMember.js'
import type { ArrowFunction, Expression } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeFunctionExpression = (
  args: ChildAnalysisArg<FunctionLikeNodeType | Expression>,
  expression: ArrowFunction,
): ExpressionAnalysisResult => {
  const functionResult = analyzeFunctionMember(
    { ...args, node: expression },
    {
      isStatic: undefined,
      visibility: undefined,
      jsDocableNode: undefined,
      name: '',
    },
  )

  return {
    dependencies: [...functionResult.dependencies],
    reservedNames: [...functionResult.reservedNames],
    element: {
      kind: 'function-expression',
      function: functionResult.member,
    },
  }
}
