import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { IndexedAccessTypeNode, TypeNode } from 'ts-morph'

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
