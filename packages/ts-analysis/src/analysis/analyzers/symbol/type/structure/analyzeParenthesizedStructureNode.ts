import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { ParenthesizedTypeNode, TypeNode } from 'ts-morph'

export const analyzeParenthesizedStructureNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: ParenthesizedTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const nodeType = node.getTypeNode()
  const nodeTypeResult = analyzeType(
    { ...args, node: nodeType, memberPath: [...newMemberPath], declarationOrder: 0 },
    undefined,
  )
  return {
    member: {
      kind: 'parenthesized',
      type: nodeTypeResult.member,
    },
    dependencies: [...nodeTypeResult.dependencies],
    reservedNames: nodeTypeResult.reservedNames,
  }
}
