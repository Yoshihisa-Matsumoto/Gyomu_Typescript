import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { computeIndent } from './computeIndent.js'
import type { MemberAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { InterfaceDeclaration } from 'ts-morph'
import type { ChildAnalysisArg, GetSignatureIdArg, TagAnalysisArg } from '../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeInterface = (args: TagAnalysisArg<InterfaceDeclaration>) => {
  const {
    declaration,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    options,
  } = args
  const typeName = args.declaration.getName()
  const prepared = prepareSymbolAnalysis(
    {
      declaration,
      sourceRelativePath,
      metadata,
      memberPath,
      nodeName: typeName,
      sourceFullText,
      imported,
      options,
    },
    getSignature,
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
      source: 'typescript',
      ...withOptional({ effect: detectEffectSignals(typeName) }),
    },
    identity,
    startOffset: args.declaration.getStart(),
    ...withOptional({ jsDoc: prepared.jsDoc, parsedJsDoc: prepared.parsedJsDoc }),
    members: analyzeInterfaceMembers({
      sourceRelativePath,
      metadata,
      node: declaration,
      ownerSymbolId: prepared.id,
      ownerSymbolIdentity: identity,
      memberPath: [],
      sourceFullText,
      imported,
      options,
      declarationOrder: 0,
    }),
    declarationOrder: args.declarationOrder,
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
    isExported: args.declaration.isExported(),
  }
}

const getSignature = (args: GetSignatureIdArg<InterfaceDeclaration>) => {
  return { id: 'interface', parameters: [] }
}

const analyzeInterfaceMembers = (
  args: ChildAnalysisArg<InterfaceDeclaration>,
): Array<MemberAnalysis> => {
  const {
    node,
    sourceRelativePath,
    metadata,
    memberPath,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    imported,
    options,
  } = args
  return node.getMembers().flatMap((member, index) => {
    if (Node.isPropertySignature(member)) {
      const typeNode = member.getTypeNode()
      if (Node.isFunctionTypeNode(typeNode)) {
        return [
          analyzeFunctionMember(
            {
              sourceRelativePath,
              metadata,
              node: typeNode,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath,
              sourceFullText,
              declarationOrder: index,
              imported,
              options,
            },
            {
              isStatic: undefined,
              visibility: undefined,
              name: member.getName(),
              jsDocableNode: member,
            },
          ),
        ] as Array<MemberAnalysis>
      }
      // console.log(`PromPmember, ${index}`)
      return [
        analyzePropertyMember({
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
        }),
      ]
    }

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
            isStatic: undefined,
            visibility: undefined,
            name: member.getName(),
            jsDocableNode: member,
          },
        ),
      ] as Array<MemberAnalysis>
    }

    return [] as Array<MemberAnalysis>
  })
}
