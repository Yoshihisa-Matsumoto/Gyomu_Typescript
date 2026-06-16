import { withOptional } from '@gyomu/schema'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { analyzeObjectMembers } from './analyzeObjectMembers.js'
import { computeIndent } from './computeIndent.js'
import type { TypeAliasDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeTypeAliasDeclaration = (
  args: JSDocableTagAnalysisArg<TypeAliasDeclaration>,
) => {
  const typeName = args.name ?? args.declaration.getName()
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    args.memberPath,
    getSignatureId,
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
    kind: 'type',
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
    ...withOptional({ jsDoc: prepared.jsDoc, parsedJsDoc: prepared.parsedJsDoc }),
    members: analyzeObjectMembers(
      args.sourceRelativePath,
      args.metadata,
      args.declaration,
      prepared.id,
      identity,
      [],
      args.sourceFullText,
    ),
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
    symbol: symbol,
    isDefault: args.declaration.isDefaultExport(),
    exportedName: args.declaration.getName(),
  }
}

const getSignatureId = () => {
  return { id: 'type', parameters: [] }
}
