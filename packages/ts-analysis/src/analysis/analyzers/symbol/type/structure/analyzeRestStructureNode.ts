import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { RestTypeNode, TypeNode } from 'ts-morph'

/**
 * Analyzes a RestTypeNode structure and returns the corresponding type analysis result.
 *
 * @param args The current analysis arguments.
 *
 * @param newMemberPath The path to the new member identity.
 *
 * @param node The rest type node to analyze.
 *
 * @returns The analysis result containing the rest type structure and dependencies.
 */
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
