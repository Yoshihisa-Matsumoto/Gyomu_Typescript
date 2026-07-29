import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { NamedTupleMember, TypeNode } from 'ts-morph'

/**
 * Analyzes a named tuple member structure node, extracting its type information, name, and optionality status.
 *
 * @param args The current analysis arguments containing context for the type node.
 *
 * @param newMemberPath The path identifying the member within the structure.
 *
 * @param node The named tuple member node to analyze.
 *
 * @returns A result object containing the analyzed member structure, including its kind, name, type, and optionality, along with collected dependencies and reserved names.
 */
export const analyzeNamedTupleMemberStructureNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: NamedTupleMember,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const nodeType = node.getTypeNode()
  const nodeTypeResult = analyzeType(
    { ...args, node: nodeType, memberPath: [...newMemberPath], declarationOrder: 0 },
    undefined,
  )
  return {
    member: {
      kind: 'namedTupleMember',
      type: nodeTypeResult.member,
      name: node.getName(),
      optional: !!node.getQuestionTokenNode(),
    },
    dependencies: [...nodeTypeResult.dependencies],
    reservedNames: nodeTypeResult.reservedNames,
  }
}
