import { SignatureId } from '@gyomu/schema/typescript'
import { Node } from 'ts-morph'
import { createMemberIdentityAndId } from '../../../shared/createMemberIdentity.js'
import { analyzeType, getUndefinedTypeResult } from '../type/analyzeType.js'
import type { ParameterDeclaration, TypeNode } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { NonDocumentableTypeProperty } from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a TypeScript parameter declaration to extract property metadata.
 *
 * @param args The parameter declaration and analysis context.
 *
 * @returns An object containing the analyzed type property result and associated dependencies.
 */
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
    registerSymbol,
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

  const typeResult =
    typeNode || initializer
      ? analyzeType(
          {
            node: typeNode ?? initializer!,

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
            registerSymbol,
          },
          [name],
          undefined,
        )
      : getUndefinedTypeResult()
  return {
    member: {
      documentable: false,
      readonly: node.isReadonly(),
      id,
      identity,
      kind: 'type-property',
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

/**
 * Analyzes a TypeScript type node to extract property metadata.
 *
 * @param args The type node and analysis context.
 *
 * @returns An object containing the analyzed type property result derived from the type node.
 */
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
    registerSymbol,
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
      registerSymbol,
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
      kind: 'type-property',
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
