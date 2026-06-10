import { withOptional } from '@gyomu/schema'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { computeIndent } from './computeIndent.js'
import type { EnumDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeEnumDeclaration = (args: JSDocableTagAnalysisArg<EnumDeclaration>) => {
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
    kind: 'enum',
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
    members: [],
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
  }
}

const getSignatureId = () => {
  return { id: 'enum', parameters: [] }
}
