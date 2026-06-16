import { SyntaxKind } from 'ts-morph'
import { prepareMethodAnalysis } from '../prepareMemberAnalysis.js'
import {
  analyzePropertyMember,
  analyzePropertyMemberInternal,
} from '../struct/analyzePropertyMember.js'
import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'
import type {
  GetAccessorDeclaration,
  ModifierableNode,
  PropertyDeclaration,
  SetAccessorDeclaration,
} from 'ts-morph'
import type {
  DocumentablePropertyMemberAnalysis,
  MemberAccessor,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
} from '@gyomu/schema/typescript'
import type { ProjectRelativePath } from '../../../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeClassPropertyMember = (args: {
  sourcePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  node: PropertyDeclaration
  ownerSymbolId: MemberIdentityOwnerSymbolId
  ownerSymbolIdentity: SymbolIdentity
  memberPath: MemberIdentityMemberPath
  sourceFullText: string
  declarationOrder: number
}): DocumentablePropertyMemberAnalysis => {
  return analyzePropertyMember(args, args.node.isStatic(), getAccessor(args.node))
  // const { sourcePath, metadata, node, ownerSymbolId, memberPath } = args
  // const typeNode = node.getTypeNode()
  // const initializer = node.getInitializer()
  // const name = node.getName()
  // const { identity, jsDoc, location, startOffset } = preparePropertyAnalysis(
  //   sourcePath,
  //   metadata,
  //   ownerSymbolId,
  //   memberPath,
  //   name,
  //   node,
  //   node,
  // )
  // return {
  //   kind: 'property',
  //   source: 'property-declaration',
  //   identity,
  //   name,
  //   readonly: node.isReadonly(),
  //   optional: !!node.getQuestionTokenNode(),

  //   ...withOptional({
  //     type: analyzeType({
  //       node: typeNode,
  //       initializer,
  //       memberPath,
  //       metadata,
  //       ownerSymbolId,
  //       sourcePath,
  //       nodeName: [name],
  //     }),
  //     jsDoc,
  //   }),
  //   location,
  //   startOffset,

  //   static: node.isStatic(),
  //   visibility: getAccessor(node),
  // }
}

export const analyzeGetSetAccessor = (
  args: {
    sourcePath: ProjectRelativePath
    metadata: FileAnalysisMetadata
    node: GetAccessorDeclaration
    ownerSymbolId: MemberIdentityOwnerSymbolId
    ownerSymbolIdentity: SymbolIdentity
    memberPath: MemberIdentityMemberPath
    sourceFullText: string
    declarationOrder: number
  },
  setter?: SetAccessorDeclaration,
): DocumentablePropertyMemberAnalysis => {
  const { sourcePath, metadata, node, ownerSymbolId, ownerSymbolIdentity, memberPath } = args
  const name = node.getName()

  const { id, identity, jsDoc, location, startOffset, parsedJsDoc } = prepareMethodAnalysis(
    sourcePath,
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
