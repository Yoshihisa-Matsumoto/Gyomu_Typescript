import { withOptional } from '@gyomu/schema'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'
import type { ClassDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'

export const analyzeClassDeclaration = (args: JSDocableTagAnalysisArg<ClassDeclaration>) => {
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
    kind: 'class',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    identity: {
      symbolId: args.name ?? args.declaration.getName() ?? '',
      signatureId: prepared.signature.id,
    },
    startOffset: args.declaration.getStart(),
    ...withOptional({ jsDoc: prepared.jsDoc }),
  } satisfies SymbolAnalysis
  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}

const getSignatureId = (declaration: ClassDeclaration) => {
  return { id: 'class', parameters: [] }
}
