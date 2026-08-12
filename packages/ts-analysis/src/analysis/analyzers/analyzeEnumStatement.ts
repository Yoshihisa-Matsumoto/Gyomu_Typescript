import { analyzeEnum } from './symbol/enum/analyzeEnum.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/schemas/typescript'
import type { StatementAnalysisArgument, StatementAnalysisResult } from './types.js'
import type { EnumDeclaration } from 'ts-morph'

/**
 * Analyzes a TypeScript enum declaration and produces a statement analysis result containing exported symbols and internal symbol definitions.
 *
 * @param statement The enum declaration to be analyzed.
 *
 * @param args The arguments containing context and options for the analysis.
 *
 * @returns Returns a StatementAnalysisResult containing the findings of the enum analysis.
 */
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
    registerSymbol: true,
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
