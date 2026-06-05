import { withOptional } from '@gyomu/schema'
import { SyntaxKind } from 'ts-morph'
import { analyzeType } from '../analyzeType.js'
import type {
  GetAccessorDeclaration,
  ModifierableNode,
  PropertyDeclaration,
  SetAccessorDeclaration,
} from 'ts-morph'
import type { MemberAccessor, PropertyMemberAnalysis } from '../../../symbol/MemberAnalysis.js'

export const analyzePropertyMember = (node: PropertyDeclaration): PropertyMemberAnalysis => {
  const typeNode = node.getTypeNode()
  const initializer = node.getInitializer()
  return {
    kind: 'property',
    name: node.getName(),
    readonly: node.isReadonly(),
    optional: !!node.getQuestionTokenNode(),
    static: node.isStatic(),
    visibility: getAccessor(node),
    ...withOptional({ type: analyzeType({ node: typeNode, initializer }) }),
  }
}

export const analyzeGetSetAccessor = (
  getter: GetAccessorDeclaration,
  setter?: SetAccessorDeclaration,
): PropertyMemberAnalysis => {
  return {
    kind: 'property',
    name: getter.getName(),
    readonly: !setter,
    visibility: getAccessor(getter),
    optional: false,
    static: getter.isStatic(),
  }
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
