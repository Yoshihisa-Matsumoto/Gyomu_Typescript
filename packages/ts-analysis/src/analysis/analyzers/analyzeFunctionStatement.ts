import { analyzeFunction } from './symbol/analyzeFunction.js'
import type { StatementAnalysisArgument, StatementAnalysisResult } from './types.js'
import type { FunctionDeclaration } from 'ts-morph'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/schemas/typescript'

export const analyzeFunctionStatement = (
  statement: FunctionDeclaration,
  args: StatementAnalysisArgument,
): StatementAnalysisResult => {
  const result = {
    exported: new Array<ExportAnalysis>(),
    symbols: new Array<SymbolAnalysis>(),
  } satisfies StatementAnalysisResult
  const {
    metadata,
    sourceRelativePath,
    memberPath,
    sourceFullText,
    declarationOrder,
    options,
    imported,
  } = args

  const functionResult = analyzeFunction({
    declaration: statement,
    options,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,

    declarationOrder,
  })
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
