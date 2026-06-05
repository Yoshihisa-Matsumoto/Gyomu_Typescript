import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import { analyzeFunctionMember, analyzeMethodMember } from './struct/analyzeMethodMember.js'
import type { MemberAnalysis } from '../../symbol/MemberAnalysis.js'
import type { InterfaceDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'

export const analyzeInterfaceDeclaration = (
  args: JSDocableTagAnalysisArg<InterfaceDeclaration>,
) => {
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    getSignature,
  )
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'interface',
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
    members: analyzeInterfaceMembers(args.declaration),
  } satisfies SymbolAnalysis
  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}

const getSignature = (declaration: InterfaceDeclaration) => {
  return { id: 'interface', parameters: [] }
}

const analyzeInterfaceMembers = (node: InterfaceDeclaration): Array<MemberAnalysis> => {
  return node.getMembers().flatMap((member) => {
    if (Node.isPropertySignature(member)) {
      const typeNode = member.getTypeNode()
      if (Node.isFunctionTypeNode(typeNode)) {
        return [analyzeFunctionMember(member.getName(), typeNode)]
      }
      return [analyzePropertyMember(member)]
    }

    if (Node.isMethodSignature(member)) {
      return [analyzeMethodMember(member)]
    }

    return [] as Array<MemberAnalysis>
  })
}
