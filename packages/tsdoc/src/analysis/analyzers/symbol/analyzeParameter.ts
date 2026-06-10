import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { createMemberIdentityAndId } from '../../shared/createMemberIdentity.js'
import { analyzeType } from './analyzeType.js'
import type { ParameterDeclaration } from 'ts-morph'
import type { ProjectRelativePath } from '../../types.js'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
import type {
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
  NonDocumentablePropertyMemberAnalysis,
} from '../../symbol/MemberAnalysis.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'

export const analyzeParameter = (
  node: ParameterDeclaration,
  sourceRelativePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  sourceFullText: string,
  declarationOrder: number,
): NonDocumentablePropertyMemberAnalysis => {
  const typeNode = node.getTypeNode()
  const name = node.getName()
  const initializer = node.getInitializer()
  const { id, identity } = createMemberIdentityAndId(
    {
      ownerSymbolId,
      memberPath,
      signatureId: name,
    },
    ownerSymbolIdentity,
  )

  return {
    kind: 'property',
    documentable: false,
    readonly: node.isReadonly(),
    source: 'parameter-declaration',
    static: Node.isStaticable(node) ? node.isStatic() : false,
    visibility: 'public',
    ownerSymbolId,
    id,
    identity,
    name,

    optional: !!node.getQuestionTokenNode(),

    rest: !!node.getDotDotDotToken(),

    ...withOptional({
      type: analyzeType({
        node: typeNode,
        initializer,
        sourcePath: sourceRelativePath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        nodeName: [name],
        sourceFullText,
        declarationOrder,
      }),
    }),
    declarationOrder,
    // structure: analyzeParameterStructure(withOptional({ node: typeNode, initializer })),
  }
}
