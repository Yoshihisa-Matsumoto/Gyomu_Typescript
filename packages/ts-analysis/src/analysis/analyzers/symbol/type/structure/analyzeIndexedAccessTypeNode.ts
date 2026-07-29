import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { IndexedAccessTypeNode, TypeNode } from 'ts-morph'

/**
 * Analyzes an IndexedAccessTypeNode to resolve the structure of the object and index types.
 *
 * @param args The shared analysis context and arguments.
 *
 * @param newMemberPath The path identifier for the current member.
 *
 * @param typeNode The indexed access type node to analyze.
 *
 * @returns Returns the analyzed structure containing the object type and index type members, along with collected dependencies and reserved names.
 */
export const analyzeIndexedAccessTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  typeNode: IndexedAccessTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const objectType = typeNode.getObjectTypeNode()
  const indexType = typeNode.getIndexTypeNode()

  const objectTypeResult = analyzeType(
    { ...args, node: objectType, declarationOrder: 0, memberPath: [...newMemberPath, 'object'] },
    undefined,
  )
  const indexTypeResult = analyzeType(
    { ...args, node: indexType, declarationOrder: 0, memberPath: [...newMemberPath, 'index'] },
    undefined,
  )
  return {
    member: {
      kind: 'indexedAccess',
      indexType: indexTypeResult.member,
      objectType: objectTypeResult.member,
    },
    dependencies: [...indexTypeResult.dependencies, ...objectTypeResult.dependencies],
    reservedNames: [...indexTypeResult.reservedNames, ...objectTypeResult.reservedNames],
  }
}
