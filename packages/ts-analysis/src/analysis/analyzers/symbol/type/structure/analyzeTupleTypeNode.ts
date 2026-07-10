import { analyzeTypePropertyFromTypeNode } from '../analyzeTypeProperty.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { TupleTypeNode, TypeNode } from 'ts-morph'

export const analyzeTupleTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: TupleTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const elementsResult = node.getElements().map((element, index) =>
    analyzeTypePropertyFromTypeNode({
      ...args,
      node: element,
      declarationOrder: index,
      memberPath: [...newMemberPath, index],
    }),
  )

  return {
    member: {
      kind: 'tuple',
      elements: elementsResult.map((element) => element.member),
    },
    dependencies: [...elementsResult.map((element) => element.dependencies).flat()],
    reservedNames: [...elementsResult.map((element) => element.reservedNames).flat()],
  }
}
