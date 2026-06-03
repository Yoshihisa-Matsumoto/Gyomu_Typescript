import { withOptional } from '@gyomu/schema'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
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
  } satisfies SymbolAnalysis
  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}

const getSignature = (declaration: InterfaceDeclaration) => {
  return { id: 'interface', parameters: [] }
}
