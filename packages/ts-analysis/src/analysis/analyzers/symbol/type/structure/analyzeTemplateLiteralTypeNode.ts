import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type { TemplateLiteralTypeNode, TypeNode } from 'ts-morph'

/**
 * Analyzes a TypeScript `TemplateLiteralTypeNode` and extracts the associated template spans.
 *
 * @param args The shared analysis context and arguments for the child node.
 *
 * @param newMemberPath The path identifying the current member in the structure hierarchy.
 *
 * @param node The template literal type node to be analyzed.
 *
 * @returns Returns a `MemberAnalysisWithReservedResult` containing the `templateLiteral` structure and associated dependencies or reserved names.
 */
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
