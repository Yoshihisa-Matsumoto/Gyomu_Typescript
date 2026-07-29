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
import type {
  DocumentablePropertyMemberAnalysis,
  MemberAccessor,
} from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a class property member by extracting its static status and visibility.
 *
 * @param args The analysis context for the property declaration.
 *
 * @returns The analysis result for the property member.
 */
export const analyzeClassPropertyMember = (
  args: ChildAnalysisArg<PropertyDeclaration>,
): MemberAnalysisResult<DocumentablePropertyMemberAnalysis> => {
  return analyzePropertyMember(args, args.node.isStatic(), getAccessor(args.node))
}

/**
 * Analyzes a getter and optional setter accessor pair within a class.
 *
 * @param args The analysis context for the getter declaration.
 *
 * @param setter The optional setter declaration paired with the getter.
 *
 * @returns The analysis result for the property member defined by the accessors.
 */
export const analyzeGetSetAccessor = (
  args: ChildAnalysisArg<GetAccessorDeclaration>,
  setter?: SetAccessorDeclaration,
): MemberAnalysisResult<DocumentablePropertyMemberAnalysis> => {
  const {
    sourceRelativePath,
    metadata,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    options,
  } = args
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
    options,
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

/**
 * Determines the visibility modifier (public, protected, or private) for a given class node.
 *
 * @param node The node to analyze for visibility modifiers.
 *
 * @returns The detected MemberAccessor, defaulting to 'public'.
 */
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
