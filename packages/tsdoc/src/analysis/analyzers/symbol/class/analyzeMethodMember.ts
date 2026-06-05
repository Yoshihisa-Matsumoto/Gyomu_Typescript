import { withOptional } from '@gyomu/schema'
import { analyzeType } from '../analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import { getAccessor } from './analyzePropertyMember.js'
import type { MethodDeclaration } from 'ts-morph'
import type { MethodMemberAnalysis } from '../../../symbol/MemberAnalysis.js'

export const analyzeMethodMember = (node: MethodDeclaration): MethodMemberAnalysis => {
  const returnTypeNode = node.getReturnTypeNode()

  return {
    kind: 'method',
    name: node.getName(),
    visibility: getAccessor(node),
    parameters: node.getParameters().map(analyzeParameter),
    static: node.isStatic(),
    ...withOptional({ returnType: analyzeType({ node: returnTypeNode, initializer: undefined }) }),
  }
}
