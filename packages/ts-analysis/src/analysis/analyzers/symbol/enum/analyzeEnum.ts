import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from '../prepareSymbolAnalysis.js'
import { detectEffectSignals } from '../analyzeEffectType.js'
import { computeIndent } from '../computeIndent.js'

import { analyzeEnumMember } from './analyzeEnumMember.js'
import type { EnumDeclaration } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisResult, TagAnalysisArg } from '../../types.js'
import type {
  DocumentablePropertyMemberAnalysis,
  MemberAnalysis,
  SymbolAnalysis,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'

export const analyzeEnum = (args: TagAnalysisArg<EnumDeclaration>) => {
  const typeName = args.declaration.getName()
  const {
    declaration,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    options,
  } = args
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
      reservedNames: [],
    },
    getSignatureId,
  )
  const identity: SymbolIdentity = {
    symbolId: SymbolId(typeName),
    signatureId: prepared.signature.id,
  }
  const membersResult = analyzeEnumMembers({
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
    reservedNames: [],
  })
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'enum',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    type: {
      text: typeName,
      source: 'typescript',
      effect: detectEffectSignals(typeName),
    },
    identity,
    startOffset: args.declaration.getStart(),
    jsDoc: prepared.jsDoc,
    parsedJsDoc: prepared.parsedJsDoc,
    members: membersResult.member,
    declarationOrder: args.declarationOrder,
    dependencyCandidates: [...membersResult.dependencies],
    docIndent: computeIndent(
      args.sourceFullText,
      args.declaration.getStart(),
      args.declaration.getStartLinePos(),
    ),
  } satisfies SymbolAnalysis

  registerSymbolSymbolAnalysis(args.metadata, symbol)

  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
    isExported: args.declaration.isExported(),
  }
}

const getSignatureId = () => {
  return { id: SignatureId('enum'), parameters: [], dependencyCandidates: [] }
}

const analyzeEnumMembers = (
  args: ChildAnalysisArg<EnumDeclaration>,
): MemberAnalysisResult<Array<MemberAnalysis>> => {
  const {
    node,
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    sourceFullText,
    imported,
    options,
    reservedNames,
  } = args
  const nodeMembers = node.getMembers()

  let previousNumber: number | undefined = undefined
  const members = nodeMembers
    .flatMap<MemberAnalysisResult<DocumentablePropertyMemberAnalysis> | undefined>(
      (member, index) => {
        const result = analyzeEnumMember(
          {
            node: member,
            declarationOrder: index,
            imported,
            options,
            memberPath,
            metadata,
            ownerSymbolId,
            ownerSymbolIdentity,
            reservedNames,
            sourceFullText,
            sourceRelativePath,
          },
          { previousNumber },
        )
        const structure = result.member.type?.structure
        if (structure && structure.kind == 'literal' && typeof structure.elementValue == 'number') {
          previousNumber = structure.elementValue
        } else {
          previousNumber = undefined
        }
        return result
      },
    )
    .filter((m) => !!m)
    .flat()

  return {
    member: members.map((m) => m.member),
    dependencies: members.map((m) => m.dependencies).flat(),
  }
}
