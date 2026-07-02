import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { computeIndent } from './computeIndent.js'
import type { SymbolAnalysis } from '@gyomu/schema/typescript'
import type { EnumDeclaration } from 'ts-morph'

import type { TagAnalysisArg } from '../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

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
      source: 'typescript',
      effect: detectEffectSignals(typeName),
    },
    identity,
    startOffset: args.declaration.getStart(),
    jsDoc: prepared.jsDoc,
    parsedJsDoc: prepared.parsedJsDoc,
    members: [],
    declarationOrder: args.declarationOrder,
    dependencyCandidates: [],
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

const getSignatureId = () => {
  return { id: 'enum', parameters: [] }
}
