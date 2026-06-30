import { Node } from 'ts-morph'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import type { ChildAnalysisArg } from '../types.js'
import type { TypeAliasDeclaration, VariableDeclaration } from 'ts-morph'
import type { MemberAnalysis } from '@gyomu/schema/typescript'

export const analyzeObjectMembers = (
  args: ChildAnalysisArg<TypeAliasDeclaration | VariableDeclaration>,
): Array<MemberAnalysis> => {
  const {
    node,
    metadata,
    sourceRelativePath,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    sourceFullText,
    imported,
    options,
  } = args
  const typeNode = node.getTypeNode()
  if (Node.isTypeLiteral(typeNode)) {
    return typeNode.getMembers().flatMap((member, index) => {
      if (Node.isMethodSignature(member)) {
        return [
          analyzeFunctionMember(
            {
              sourceRelativePath,
              metadata,
              node: member,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath,
              sourceFullText,
              declarationOrder: index,
              imported,
              options,
            },
            {
              isStatic: false,
              visibility: undefined,
              jsDocableNode: member,
              name: member.getName(),
            },
          ),
        ] as Array<MemberAnalysis>
      }

      if (Node.isPropertySignature(member)) {
        const newMemberPath = [...memberPath]
        const memberTypeNode = member.getTypeNode()
        if (Node.isFunctionTypeNode(memberTypeNode)) {
          return [
            analyzeFunctionMember(
              {
                sourceRelativePath,
                metadata,
                node: memberTypeNode,
                ownerSymbolId,
                ownerSymbolIdentity,
                memberPath: newMemberPath,
                sourceFullText,
                declarationOrder: index,
                imported,
                options,
              },
              {
                isStatic: false,
                jsDocableNode: member,
                name: member.getName(),
                visibility: undefined,
              },
            ),
          ] as Array<MemberAnalysis>
        }
        return [
          analyzePropertyMember({
            sourceRelativePath,
            metadata,
            node: member,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath: newMemberPath,
            sourceFullText,
            declarationOrder: index,
            imported,
            options,
          }),
        ] as Array<MemberAnalysis>
      }

      return [] as Array<MemberAnalysis>
    })
  }
  return [] as Array<MemberAnalysis>
}
