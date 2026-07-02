import { analyzeTypeAlias } from './symbol/analyzeTypeAlias.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { StatementAnalysisArgument, StatementAnalysisResult } from './types.js'
import type { TypeAliasDeclaration } from 'ts-morph'

export const analyzeTypeAliasStatement = (
  statement: TypeAliasDeclaration,
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

  const typeAliasResult = analyzeTypeAlias({
    declaration: statement,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    declarationOrder,
    options,
  })
  if (typeAliasResult.isExported) {
    result.exported.push({
      kind: 'local',
      isTypeOnly: false,
      exportedName: typeAliasResult.exportedName,
      isDefault: typeAliasResult.isDefault,
      identity: typeAliasResult.symbol.identity,
    })
  }
  result.symbols.push(typeAliasResult.symbol)

  return result
}
