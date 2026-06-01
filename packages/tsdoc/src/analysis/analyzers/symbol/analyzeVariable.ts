import { withOptional } from '@gyomu/schema'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import type { ProjectRelativePath } from '../../types.js'
import type { VariableDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { AnalysisOptions } from '../../AnalysisOption.js'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'

export const analyzeVariableDeclaration = (args: {
  declaration: VariableDeclaration
  sourceRelativePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  name?: string
  options?: AnalysisOptions
}) => {
  const statement = args.declaration.getVariableStatement()
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    getSignatureId,
    statement,
  )
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'const',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    name: args.name ?? args.declaration.getName(),
    ...withOptional({
      jsDoc: prepared.jsDoc,
    }),
  } satisfies SymbolAnalysis

  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}

const getSignatureId = (declaration: VariableDeclaration) => {
  return { id: 'variable', parameters: [] }
}
