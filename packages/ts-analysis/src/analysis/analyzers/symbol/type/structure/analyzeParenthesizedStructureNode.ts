import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { ParenthesizedTypeNode, TypeNode } from 'ts-morph'

/**
 * Analyzes a ParenthesizedTypeNode by extracting its inner type and recursively analyzing it.
 *
 * @param args The current analysis context and configuration.
 *
 * @param newMemberPath The path to the current structure member.
 *
 * @param node The parenthesized type node to analyze.
 *
 * @returns The analysis result containing the structured representation of the parenthesized type, including dependencies and reserved names.
 */
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
