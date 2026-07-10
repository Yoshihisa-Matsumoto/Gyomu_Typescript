import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { RestTypeNode, TypeNode } from 'ts-morph'

export const analyzeRestStructureNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: RestTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const nodeType = node.getTypeNode()
  const nodeTypeResult = analyzeType(
    { ...args, node: nodeType, memberPath: [...newMemberPath], declarationOrder: 0 },
    undefined,
  )
  return {
    member: {
      kind: 'rest',
      type: nodeTypeResult.member,
    },
    dependencies: [...nodeTypeResult.dependencies],
    reservedNames: nodeTypeResult.reservedNames,
  }
}
