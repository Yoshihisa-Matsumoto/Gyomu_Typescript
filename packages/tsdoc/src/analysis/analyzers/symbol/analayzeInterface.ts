import { withOptional } from '@gyomu/schema'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import type { InterfaceDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'

export const analyzeInterfaceDeclaration = (
  args: JSDocableTagAnalysisArg<InterfaceDeclaration>,
) => {
  const prepared = prepareSymbolAnalysis(args.declaration, args.sourceRelativePath, args.metadata)
  const symbol = {
    id: prepared.id,
    kind: 'interface',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    name: args.name ?? args.declaration.getName(),
    ...withOptional({ jsDoc: prepared.jsDoc }),
  } satisfies SymbolAnalysis
  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}
