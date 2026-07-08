import { SyntaxKind } from 'ts-morph'
import { analyzeType } from '../analyzeType.js'
import type { TypeNode, TypeOperatorTypeNode } from 'ts-morph'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../../types.js'

export const analyzeTypeOperatorTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: TypeOperatorTypeNode,
): MemberAnalysisResult<TypeStructureAnalysis> => {
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
  }
}
