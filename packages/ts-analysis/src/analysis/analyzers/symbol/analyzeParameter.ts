import { Node } from 'ts-morph'
import { SignatureId } from '@gyomu/schema/typescript'
import { createMemberIdentityAndId } from '../../shared/createMemberIdentity.js'
import { analyzeType } from './type/analyzeType.js'
import type { NonDocumentablePropertyMemberAnalysis } from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../types.js'
import type { ParameterDeclaration } from 'ts-morph'

export const analyzeParameter = (
  args: ChildAnalysisArg<ParameterDeclaration>,
): MemberAnalysisWithReservedResult<NonDocumentablePropertyMemberAnalysis> => {
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
      signatureId: SignatureId(name),
    },
    ownerSymbolIdentity,
  )

  const typeResult = analyzeType(
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
      reservedNames: [],
    },
    [name],
    undefined,
  )
  return {
    member: {
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

      type: typeResult.member,

      declarationOrder,
      // structure: analyzeParameterStructure(withOptional({ node: typeNode, initializer })),
    },
    dependencies: typeResult.dependencies,
    reservedNames: [...typeResult.reservedNames],
  }
}
