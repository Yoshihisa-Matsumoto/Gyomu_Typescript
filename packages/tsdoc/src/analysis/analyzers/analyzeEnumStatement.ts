import { analyzeEnum } from './symbol/analyzeEnum.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { StatementAnalysisArgument, StatementAnalysisResult } from './types.js'
import type { EnumDeclaration } from 'ts-morph'

export const analyzeEnumStatement = (
  statement: EnumDeclaration,
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

  const enumResult = analyzeEnum({
    declaration: statement,
    options,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    declarationOrder,
  })
  if (enumResult.isExported) {
    result.exported.push({
      kind: 'local',
      exportedName: enumResult.isDefault ? '$default' : statement.getName(),
      isTypeOnly: false,
      isDefault: enumResult.isDefault,
      identity: enumResult.symbol.identity,
    })
  }
  result.symbols.push(enumResult.symbol)

  return result
}
