import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { TemplateLiteralTypeNode, TypeNode } from 'ts-morph'

export const analyzeTemplateLiteralTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: TemplateLiteralTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const spansResult = node
    .getTemplateSpans()
    .map((span, index) =>
      analyzeType(
        { ...args, node: span, declarationOrder: index, memberPath: [...newMemberPath, index] },
        undefined,
      ),
    )

  return {
    member: {
      kind: 'templateLiteral',
      spans: spansResult.map((span) => span.member),
    },
    dependencies: [...spansResult.map((span) => span.dependencies).flat()],
    reservedNames: [...spansResult.map((span) => span.reservedNames).flat()],
  }
}
