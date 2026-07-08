import { analyzeType } from '../analyzeType.js'
import { analyzeTypeProperty } from '../analyzeTypeProperty.js'
import type {
  MemberIdentityMemberPath,
  TypeAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../../types.js'
import type { ConstructorTypeNode, TypeNode } from 'ts-morph'

export const analyzeConstructorTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: ConstructorTypeNode,
): MemberAnalysisResult<TypeStructureAnalysis> => {
  const parametersNode = node.getParameters()
  const returnTypeNode = node.getReturnTypeNode()

  const childMemberPath = [...newMemberPath, '$parameters']
  const parametersResult = parametersNode.map((p, index) =>
    analyzeTypeProperty({
      ...args,
      node: p,
      declarationOrder: index,
      memberPath: childMemberPath,
    }),
  )
  let returnTypeResult: MemberAnalysisResult<TypeAnalysis> | undefined = undefined
  if (returnTypeNode)
    returnTypeResult = analyzeType(
      {
        ...args,
        node: returnTypeNode,
        declarationOrder: 0,
        memberPath: [...newMemberPath, '$return'],
      },
      undefined,
    )

  return {
    member: {
      kind: 'constructor',
      parameters: parametersResult.map((p) => p.member),
      abstract: node.isAbstract(),
      returnType: returnTypeResult?.member,
    },
    dependencies: [
      ...(returnTypeResult?.dependencies ?? []),
      ...parametersResult.map((p) => p.dependencies).flat(),
    ],
  }
}
