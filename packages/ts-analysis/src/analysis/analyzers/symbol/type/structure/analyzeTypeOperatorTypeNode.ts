import { SyntaxKind } from 'ts-morph'
import { analyzeType } from '../analyzeType.js'
import type { TypeNode, TypeOperatorTypeNode } from 'ts-morph'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'

/**
 * Analyzes a TypeScript TypeOperatorTypeNode (such as keyof, readonly, or unique) and extracts its nested target type structure.
 *
 * @param args The shared analysis arguments containing the type node context.
 *
 * @param newMemberPath The current path in the member identity hierarchy.
 *
 * @param node The TypeScript type operator node to analyze.
 *
 * @returns A result object containing the analyzed type structure, its dependencies, and reserved names.
 */
export const analyzeTypeOperatorTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: TypeOperatorTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const operator = node.getOperator()

  const targetResult = analyzeType(
    {
      ...args,
      node: node.getTypeNode(),
      declarationOrder: 0,
      memberPath: [...newMemberPath, 'target'],
    },
    undefined,
  )

  return {
    member: {
      kind: 'typeOperator',
      operator:
        operator == SyntaxKind.KeyOfKeyword
          ? 'keyof'
          : operator == SyntaxKind.ReadonlyKeyword
            ? 'readonly'
            : 'unique',
      target: targetResult.member,
    },
    dependencies: [...targetResult.dependencies],
    reservedNames: targetResult.reservedNames,
  }
}
