import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { computeIndent } from './computeIndent.js'
import type { ProjectRelativePath } from '../../types.js'
import type {
  MemberAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
} from '../../symbol/MemberAnalysis.js'
import type { InterfaceDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeInterfaceDeclaration = (
  args: JSDocableTagAnalysisArg<InterfaceDeclaration>,
) => {
  const typeName = args.name ?? args.declaration.getName()
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    args.memberPath,
    getSignature,
    typeName,
    args.sourceFullText,
  )
  const identity: SymbolIdentity = {
    symbolId: typeName,
    signatureId: prepared.signature.id,
  }
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'interface',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    type: {
      text: typeName,
      ...withOptional({ effect: detectEffectSignals(typeName) }),
    },
    identity,
    startOffset: args.declaration.getStart(),
    ...withOptional({ jsDoc: prepared.jsDoc }),
    members: analyzeInterfaceMembers(
      args.sourceRelativePath,
      args.metadata,
      args.declaration,
      prepared.id,
      identity,
      [],
      args.sourceFullText,
    ),
  } satisfies SymbolAnalysis
  registerSymbolSymbolAnalysis(
    args.metadata,
    symbol,
    computeIndent(
      args.sourceFullText,
      args.declaration.getStart(),
      args.declaration.getStartLinePos(),
    ),
  )
  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}

const getSignature = (declaration: InterfaceDeclaration) => {
  return { id: 'interface', parameters: [] }
}

const analyzeInterfaceMembers = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  node: InterfaceDeclaration,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  sourceFullText: string,
): Array<MemberAnalysis> => {
  return node.getMembers().flatMap((member) => {
    if (Node.isPropertySignature(member)) {
      const typeNode = member.getTypeNode()
      if (Node.isFunctionTypeNode(typeNode)) {
        return [
          analyzeFunctionMember({
            sourcePath,
            metadata,
            name: member.getName(),
            node: typeNode,
            jsDocableNode: member,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath,
            sourceFullText,
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
          memberPath,
          sourceFullText,
        }),
      ]
    }

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
        }),
      ] as Array<MemberAnalysis>
    }

    return [] as Array<MemberAnalysis>
  })
}
