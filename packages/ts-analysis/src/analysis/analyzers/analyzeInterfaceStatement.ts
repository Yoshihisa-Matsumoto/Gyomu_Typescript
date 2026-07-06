import { analyzeInterface } from './symbol/analyzeInterface.js'

import type { StatementAnalysisArgument, StatementAnalysisResult } from './types.js'
import type { InterfaceDeclaration } from 'ts-morph'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/schemas/typescript'

export const analyzeInterfaceStatement = (
  statement: InterfaceDeclaration,
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

  const interfaceResult = analyzeInterface({
    declaration: statement,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    declarationOrder,
    options,
  })
  if (interfaceResult.isExported) {
    result.exported.push({
      kind: 'local',
      exportedName: interfaceResult.isDefault ? '$default' : statement.getName(),
      isTypeOnly: false,
      isDefault: interfaceResult.isDefault,
      identity: interfaceResult.symbol.identity,
    })
  }
  result.symbols.push(interfaceResult.symbol)

  return result
}
