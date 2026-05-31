import { withOptional } from '@gyomu/schema'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import type { TypeAliasDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'

export const analyzeTypeAliasDeclaration = (
  args: JSDocableTagAnalysisArg<TypeAliasDeclaration>,
) => {
  const prepared = prepareSymbolAnalysis(args.declaration, args.sourceRelativePath, args.metadata)
  const symbol = {
    id: prepared.id,
    kind: 'type',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    name: args.name ?? args.declaration.getName(),
    ...withOptional({ jsDoc: prepared.jsDoc }),
  } satisfies SymbolAnalysis
  return {
    symbol: symbol,
    isDefault: args.declaration.isDefaultExport(),
    exportedName: args.declaration.getName(),
  }
}
