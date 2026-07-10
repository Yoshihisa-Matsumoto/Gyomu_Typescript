import { SignatureId } from '@gyomu/schema/typescript'
import { Node } from 'ts-morph'
import { createMemberIdentityAndId } from '../../../shared/createMemberIdentity.js'
import { analyzeType } from '../type/analyzeType.js'
import type { ParameterDeclaration, TypeNode } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { NonDocumentableTypeProperty } from '@gyomu/schema/schemas/typescript/index'

export const analyzeTypeProperty = (
  args: ChildAnalysisArg<ParameterDeclaration>,
): MemberAnalysisWithReservedResult<NonDocumentableTypeProperty> => {
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
    reservedNames,
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
      reservedNames,
    },
    [name],
    undefined,
  )
  return {
    member: {
      documentable: false,
      readonly: node.isReadonly(),
      id,
      identity,
      name,

      optional: !!node.getQuestionTokenNode(),

      rest: !!node.getDotDotDotToken(),

      type: typeResult.member,
      declarationOrder: args.declarationOrder,

      // structure: analyzeParameterStructure(withOptional({ node: typeNode, initializer })),
    } satisfies NonDocumentableTypeProperty,
    dependencies: typeResult.dependencies,
    reservedNames: typeResult.reservedNames,
  }
}

export const analyzeTypePropertyFromTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
): MemberAnalysisWithReservedResult<NonDocumentableTypeProperty> => {
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
    reservedNames,
  } = args
  const typeNode = node
  const name = Node.isNamed(node) ? node.getName() : ''

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
      node: typeNode,

      sourceRelativePath,
      metadata,
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      sourceFullText,
      declarationOrder,
      imported,
      options,
      reservedNames,
    },
    [name],
    undefined,
  )
  return {
    member: {
      documentable: false,
      readonly: false,
      id,
      identity,
      name,

      optional:
        Node.isOptionalTypeNode(node) ||
        (Node.isNamedTupleMember(node) ? !!node.getQuestionTokenNode() : false),

      rest: Node.isRestTypeNode(node),

      type: typeResult.member,
      declarationOrder: args.declarationOrder,

      // structure: analyzeParameterStructure(withOptional({ node: typeNode, initializer })),
    } satisfies NonDocumentableTypeProperty,
    dependencies: typeResult.dependencies,
    reservedNames: typeResult.reservedNames,
  }
}
