import { Node } from 'ts-morph'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import type { TypeAliasDeclaration, VariableDeclaration } from 'ts-morph'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
import type {
  MemberAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
} from '@gyomu/schema/typescript'
import type { ProjectRelativePath } from '../../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeObjectMembers = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  declaration: TypeAliasDeclaration | VariableDeclaration,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  sourceFullText: string,
): Array<MemberAnalysis> => {
  const typeNode = declaration.getTypeNode()
  if (Node.isTypeLiteral(typeNode)) {
    return typeNode.getMembers().flatMap((member, index) => {
      if (Node.isMethodSignature(member)) {
        return [
          analyzeFunctionMember({
            sourcePath,
            metadata,
            node: member,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath,
            name: member.getName(),
            jsDocableNode: member,
            sourceFullText,
            declarationOrder: index,
          }),
        ] as Array<MemberAnalysis>
      }

      if (Node.isPropertySignature(member)) {
        const newMemberPath = [...memberPath]
        const memberTypeNode = member.getTypeNode()
        if (Node.isFunctionTypeNode(memberTypeNode)) {
          return [
            analyzeFunctionMember({
              sourcePath,
              metadata,
              name: member.getName(),
              node: memberTypeNode,
              jsDocableNode: member,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath: newMemberPath,
              sourceFullText,
              declarationOrder: index,
            }),
          ] as Array<MemberAnalysis>
        }
        return [
          analyzePropertyMember({
            sourcePath,
            metadata,
            node: member,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath: newMemberPath,
            sourceFullText,
            declarationOrder: index,
          }),
        ] as Array<MemberAnalysis>
      }

      return [] as Array<MemberAnalysis>
    })
  }
  return [] as Array<MemberAnalysis>
}
