import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { OptionalTypeNode, TypeNode } from 'ts-morph'

export const analyzeOptionalStructureNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: OptionalTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const nodeType = node.getTypeNode()
  const nodeTypeResult = analyzeType(
    { ...args, node: nodeType, memberPath: [...newMemberPath], declarationOrder: 0 },
    undefined,
  )
  return {
    member: {
      kind: 'optional',
      type: nodeTypeResult.member,
    },
    dependencies: [...nodeTypeResult.dependencies],
    reservedNames: [],
  }
}
