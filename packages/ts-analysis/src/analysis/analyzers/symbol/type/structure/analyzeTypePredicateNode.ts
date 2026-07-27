import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { TypeNode, TypePredicateNode } from 'ts-morph'

export const analyzeTypePredicateNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: TypePredicateNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const nodeType = node.getTypeNode()
  const nodeTypeResult = nodeType
    ? analyzeType(
        { ...args, node: nodeType, memberPath: [...newMemberPath], declarationOrder: 0 },
        undefined,
      )
    : undefined
  return {
    member: {
      kind: 'typePredicate',
      asserts: !!node.getAssertsModifier(),
      parameterName: node.getParameterNameNode().getText(),
      type: nodeTypeResult?.member,
    },
    dependencies: [...(nodeTypeResult?.dependencies ?? [])],
    reservedNames: nodeTypeResult?.reservedNames ?? [],
  }
}
