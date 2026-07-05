import { SignatureId } from '@gyomu/schema/typescript'
import { createMemberIdentityAndId } from '../../../shared/createMemberIdentity.js'
import { analyzeType } from '../type/analyzeType.js'
import type { NonDocumentableTypeProperty } from '@gyomu/schema/typescript'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../types.js'
import type { ParameterDeclaration } from 'ts-morph'

export const analyzeTypeProperty = (
  args: ChildAnalysisArg<ParameterDeclaration>,
): MemberAnalysisResult<NonDocumentableTypeProperty> => {
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

      type: typeResult?.member,
      declarationOrder: args.declarationOrder,

      // structure: analyzeParameterStructure(withOptional({ node: typeNode, initializer })),
    } satisfies NonDocumentableTypeProperty,
    dependencies: typeResult?.dependencies ?? [],
  }
}
