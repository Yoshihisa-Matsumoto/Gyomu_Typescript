import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { analyzeFunctionMember, analyzeMethodMember } from './struct/analyzeMethodMember.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import type { TypeAliasDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'
import type { MemberAnalysis } from '../../symbol/MemberAnalysis.js'

export const analyzeTypeAliasDeclaration = (
  args: JSDocableTagAnalysisArg<TypeAliasDeclaration>,
) => {
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    getSignatureId,
  )
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'type',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    identity: {
      symbolId: args.name ?? args.declaration.getName(),
      signatureId: prepared.signature.id,
    },
    startOffset: args.declaration.getStart(),
    ...withOptional({ jsDoc: prepared.jsDoc }),
    members: analyzeTypeLiteralMembers(args.declaration),
  } satisfies SymbolAnalysis
  return {
    symbol: symbol,
    isDefault: args.declaration.isDefaultExport(),
    exportedName: args.declaration.getName(),
  }
}

const getSignatureId = (declaration: TypeAliasDeclaration) => {
  return { id: 'type', parameters: [] }
}

const analyzeTypeLiteralMembers = (declaration: TypeAliasDeclaration): Array<MemberAnalysis> => {
  const typeNode = declaration.getTypeNode()
  if (Node.isTypeLiteral(typeNode)) {
    return typeNode.getMembers().flatMap((member) => {
      if (Node.isMethodSignature(member)) {
        return [analyzeMethodMember(member)]
      }

      if (Node.isPropertySignature(member)) {
        const typeNode = member.getTypeNode()
        if (Node.isFunctionTypeNode(typeNode)) {
          return [analyzeFunctionMember(member.getName(), typeNode)]
        }
        return [analyzePropertyMember(member)]
      }

      return [] as Array<MemberAnalysis>
    })
  }
  return [] as Array<MemberAnalysis>
}
