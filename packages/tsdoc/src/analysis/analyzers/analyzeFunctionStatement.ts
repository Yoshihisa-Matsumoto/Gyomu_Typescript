import { withOptional } from '@gyomu/schema'
import { analyzeFunction } from './symbol/analyzeFunction.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { StatementAnalysisResult } from './types.js'
import type { FunctionDeclaration } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../AnalysisOption.js'

export const analyzeFunctionStatement = (
  statement: FunctionDeclaration,
  args: {
    metadata: FileAnalysisMetadata
    sourceRelativePath: string
    memberPath: Array<string>
    sourceFullText: string
    declarationOrder: number
    options: AnalysisOptions | undefined
  },
): StatementAnalysisResult => {
  const result = {
    exported: new Array<ExportAnalysis>(),
    symbols: new Array<SymbolAnalysis>(),
  } satisfies StatementAnalysisResult
  const { metadata, sourceRelativePath, memberPath, sourceFullText, declarationOrder, options } =
    args

  const functionResult = analyzeFunction(
    withOptional({
      declaration: statement,
      options,
      sourceRelativePath,
      metadata,
      memberPath,
      sourceFullText,

      declarationOrder,
    }),
  )
  if (functionResult.isExported) {
    result.exported.push({
      kind: 'local',
      exportedName: functionResult.isDefault ? '$default' : (statement.getName() ?? ''),
      isTypeOnly: false,
      isDefault: functionResult.isDefault,
      identity: functionResult.symbol.identity,
    })
  }
  result.symbols.push(functionResult.symbol)

  return result
}
