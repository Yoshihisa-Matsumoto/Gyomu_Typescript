import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { TypeNode, TypePredicateNode } from 'ts-morph'

/**
 * Analyzes a TypeScript TypePredicateNode to extract the assertion state, parameter name, and type structure.
 *
 * @param args The analysis arguments containing the context for the TypeNode.
 *
 * @param newMemberPath The current member path for identity tracking.
 *
 * @param node The TypePredicateNode to be analyzed.
 *
 * @returns A result object containing the analyzed type predicate structure, dependencies, and reserved names.
 */
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
