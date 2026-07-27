import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { MappedTypeNode, TypeNode } from 'ts-morph'

/**
 * Analyzes a TypeScript MappedTypeNode and returns its structure, including readonly/optional modifiers, constraint, value type, and name type.
 *
 * @param args The shared context and configuration for analyzing the child node.
 *
 * @param newMemberPath The path to the current member within the identity tree.
 *
 * @param node The MappedTypeNode to analyze.
 *
 * @returns A MemberAnalysisWithReservedResult containing the structure of the mapped type.
 */
export const analyzeMappedTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: MappedTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const typeParameter = node.getTypeParameter()
  const constraint = typeParameter.getConstraint()
  const typeNode = node.getTypeNode()
  const questionToken = node.getQuestionToken()

  const nameType = node.getNameTypeNode()

  const constraintResult = analyzeType(
    {
      ...args,
      node: constraint!,
      declarationOrder: 0,
      memberPath: [...newMemberPath, 'constraint'],
    },
    undefined,
  )
  const valueTypeResult = typeNode
    ? analyzeType(
        { ...args, node: typeNode, declarationOrder: 0, memberPath: [...newMemberPath, 'value'] },
        undefined,
      )
    : undefined

  let nameTypeResult: MemberAnalysisWithReservedResult<TypeAnalysis> | undefined = undefined
  if (nameType) {
    nameTypeResult = analyzeType(
      { ...args, node: nameType, declarationOrder: 1, memberPath: [...newMemberPath, 'name'] },
      undefined,
    )
  }

  return {
    member: {
      kind: 'mapped',
      readonlyModifier: !!node.getReadonlyToken(),
      parameter: typeParameter.getName(),
      constraint: constraintResult.member,
      valueType: valueTypeResult?.member,
      optionalModifier: !!questionToken,
      nameType: nameTypeResult?.member,
    },
    dependencies: [
      ...constraintResult.dependencies,
      ...(valueTypeResult?.dependencies ?? []),
      ...(nameTypeResult?.dependencies ?? []),
    ],
    reservedNames: [
      ...constraintResult.reservedNames,
      ...(valueTypeResult?.reservedNames ?? []),
      ...(nameTypeResult?.reservedNames ?? []),
    ],
  }
}
