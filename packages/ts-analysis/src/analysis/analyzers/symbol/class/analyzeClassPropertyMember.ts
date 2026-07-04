import { SyntaxKind } from 'ts-morph'
import { prepareMethodAnalysis } from '../prepareMemberAnalysis.js'
import {
  analyzePropertyMember,
  analyzePropertyMemberInternal,
} from '../struct/analyzePropertyMember.js'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../types.js'
import type {
  GetAccessorDeclaration,
  ModifierableNode,
  PropertyDeclaration,
  SetAccessorDeclaration,
} from 'ts-morph'
import type { DocumentablePropertyMemberAnalysis } from '@gyomu/schema/typescript'
import type { MemberAccessor } from '@gyomu/schema/schemas/typescript'

export const analyzeClassPropertyMember = (
  args: ChildAnalysisArg<PropertyDeclaration>,
): MemberAnalysisResult<DocumentablePropertyMemberAnalysis> => {
  return analyzePropertyMember(args, args.node.isStatic(), getAccessor(args.node))
}

export const analyzeGetSetAccessor = (
  args: ChildAnalysisArg<GetAccessorDeclaration>,
  setter?: SetAccessorDeclaration,
): MemberAnalysisResult<DocumentablePropertyMemberAnalysis> => {
  const { sourceRelativePath, metadata, node, ownerSymbolId, ownerSymbolIdentity, memberPath } =
    args
  const name = node.getName()

  const { id, identity, jsDoc, location, startOffset, parsedJsDoc } = prepareMethodAnalysis(
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    name,
    node,
    node,
  )

  return analyzePropertyMemberInternal(args, {
    id,
    initializer: undefined,
    isStatic: args.node.isStatic(),
    typeNode: undefined,
    visibility: getAccessor(args.node),
    identity,
    jsDoc,
    parsedJsDoc,
    location,
    startOffset,
    readonly: !setter,
    optional: false,
  })

  // return {
  //   kind: 'property',
  //   source: 'property-declaration',
  //   identity,
  //   name,
  //   readonly: !setter,
  //   optional: false,

  //   ...withOptional({ jsDoc }),
  //   location,
  //   startOffset,
  //   static: node.isStatic(),
  //   visibility: getAccessor(node),
  // }
}

export const getAccessor = (node: ModifierableNode): MemberAccessor => {
  const modifiers = node.getModifiers()
  for (const modifier of modifiers) {
    switch (modifier.getKind()) {
      case SyntaxKind.PublicKeyword:
        return 'public'
      case SyntaxKind.ProtectedKeyword:
        return 'protected'
      case SyntaxKind.PrivateKeyword:
        return 'private'
    }
  }

  return 'public'
}
