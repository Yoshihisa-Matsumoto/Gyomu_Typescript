import { withOptional } from '@gyomu/schema'
import { analyzeType } from '../analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import type { MethodMemberAnalysis } from '../../../symbol/MemberAnalysis.js'
import type { FunctionTypeNode, MethodSignature } from 'ts-morph'

export const analyzeMethodMember = (node: MethodSignature): MethodMemberAnalysis => {
  const returnTypeNode = node.getReturnTypeNode()
  return {
    kind: 'method',

    name: node.getName(),

    parameters: node.getParameters().map(analyzeParameter),

    ...withOptional({
      type: analyzeType({ node: returnTypeNode, initializer: undefined }),
    }),

    static: false,

    visibility: 'public',
  }
}

export const analyzeFunctionMember = (
  name: string,
  node: FunctionTypeNode,
): MethodMemberAnalysis => {
  const returnTypeNode = node.getReturnTypeNode()
  return {
    kind: 'method',

    name: name,

    parameters: node.getParameters().map(analyzeParameter),

    ...withOptional({
      returnType: analyzeType({ node: returnTypeNode, initializer: undefined }),
    }),

    static: false,

    visibility: 'public',
  }
}
