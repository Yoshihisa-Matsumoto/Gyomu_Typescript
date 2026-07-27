import { analyzeType } from '../analyzeType.js'
import { analyzeTypeProperty } from '../analyzeTypeProperty.js'
import type {
  MemberIdentityMemberPath,
  TypeAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { ConstructorTypeNode, TypeNode } from 'ts-morph'

/**
 * Analyzes a TypeScript constructor type node to extract its constructor parameters, return type, and abstract status.
 *
 * @param args The shared analysis context and arguments.
 *
 * @param newMemberPath The current path in the member hierarchy.
 *
 * @param node The constructor type node to analyze.
 *
 * @returns An analysis result containing the structured constructor member definition and associated dependencies.
 */
export const analyzeConstructorTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: ConstructorTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
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
  let returnTypeResult: MemberAnalysisWithReservedResult<TypeAnalysis> | undefined = undefined
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
    reservedNames: [
      ...(returnTypeResult?.reservedNames ?? []),
      ...parametersResult.map((p) => p.reservedNames).flat(),
    ],
  }
}
