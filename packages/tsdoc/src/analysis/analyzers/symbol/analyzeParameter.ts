import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { createMemberIdentityAndId } from '../../shared/createMemberIdentity.js'
import { analyzeType } from './analyzeType.js'
import type { ChildAnalysisArg } from '../types.js'
import type { ParameterDeclaration } from 'ts-morph'
import type { NonDocumentablePropertyMemberAnalysis } from '@gyomu/schema/typescript'

export const analyzeParameter = (
  args: ChildAnalysisArg<ParameterDeclaration>,
): NonDocumentablePropertyMemberAnalysis => {
  const {
    node,
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    sourceFullText,
    declarationOrder,
    imported,
    options,
  } = args
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
      type: analyzeType(
        {
          node: typeNode ?? initializer,

          sourceRelativePath,
          metadata,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          sourceFullText,
          declarationOrder,
          imported,
          options,
        },
        [name],
        undefined,
      ),
    }),
    declarationOrder,
    // structure: analyzeParameterStructure(withOptional({ node: typeNode, initializer })),
  }
}
