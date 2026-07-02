import { Node } from 'ts-morph'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../types.js'
import type { TypeAliasDeclaration, VariableDeclaration } from 'ts-morph'
import type { MemberAnalysis } from '@gyomu/schema/typescript'

export const analyzeObjectMembers = (
  args: ChildAnalysisArg<TypeAliasDeclaration | VariableDeclaration>,
): MemberAnalysisResult<Array<MemberAnalysis>> => {
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
    reservedNames,
  } = args
  const typeNode = node.getTypeNode()
  if (Node.isTypeLiteral(typeNode)) {
    const typeLiteralResult = typeNode
      .getMembers()
      .flatMap<MemberAnalysisResult<MemberAnalysis> | undefined>((member, index) => {
        if (Node.isMethodSignature(member)) {
          return analyzeFunctionMember(
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
              reservedNames,
            },
            {
              isStatic: false,
              visibility: undefined,
              jsDocableNode: member,
              name: member.getName(),
            },
          )
        }

        if (Node.isPropertySignature(member)) {
          const newMemberPath = [...memberPath]
          const memberTypeNode = member.getTypeNode()
          if (Node.isFunctionTypeNode(memberTypeNode)) {
            return analyzeFunctionMember(
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
                reservedNames,
              },
              {
                isStatic: false,
                jsDocableNode: member,
                name: member.getName(),
                visibility: undefined,
              },
            )
          }
          return analyzePropertyMember({
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
            reservedNames,
          })
        }

        return undefined
      })
      .filter((m) => !!m)

    return {
      member: typeLiteralResult.map((m) => m.member),
      dependencies: typeLiteralResult.map((m) => m.dependencies).flat(),
    }
  }

  return { member: [] as Array<MemberAnalysis>, dependencies: [] }
}
