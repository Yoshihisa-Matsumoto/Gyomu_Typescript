import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { ConditionalTypeNode, TypeNode } from 'ts-morph'

/**
 * Analyzes a TypeScript conditional type node (T extends U ? V : W) and decomposes it into its constituent check, extends, true, and false type structures.
 *
 * @param args The shared analysis context and configuration for the type node.
 *
 * @param newMemberPath The base path for the conditional type components.
 *
 * @param node The conditional type node to analyze.
 *
 * @returns An analysis result containing the decomposed conditional type structure, dependencies, and reserved names.
 */
export const analyzeConditionalTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: ConditionalTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const checkTypeNodeResult = analyzeType(
    {
      ...args,
      node: node.getCheckType(),
      declarationOrder: 0,
      memberPath: [...newMemberPath, 'check'],
    },
    undefined,
  )
  const extendsTypeResult = analyzeType(
    {
      ...args,
      node: node.getExtendsType(),
      declarationOrder: 0,
      memberPath: [...newMemberPath, 'extends'],
    },
    undefined,
  )
  const trueTypeResult = analyzeType(
    {
      ...args,
      node: node.getTrueType(),
      declarationOrder: 0,
      memberPath: [...newMemberPath, 'true'],
    },
    undefined,
  )
  const falseTypeResult = analyzeType(
    {
      ...args,
      node: node.getFalseType(),
      declarationOrder: 0,
      memberPath: [...newMemberPath, 'false'],
    },
    undefined,
  )
  return {
    member: {
      kind: 'conditional',
      checkType: checkTypeNodeResult.member,
      extendsType: extendsTypeResult.member,
      trueType: trueTypeResult.member,
      falseType: falseTypeResult.member,
    },
    dependencies: [
      ...checkTypeNodeResult.dependencies,
      ...extendsTypeResult.dependencies,
      ...trueTypeResult.dependencies,
      ...falseTypeResult.dependencies,
    ],
    reservedNames: [
      ...checkTypeNodeResult.reservedNames,
      ...extendsTypeResult.reservedNames,
      ...trueTypeResult.reservedNames,
      ...falseTypeResult.reservedNames,
    ],
  }
}
