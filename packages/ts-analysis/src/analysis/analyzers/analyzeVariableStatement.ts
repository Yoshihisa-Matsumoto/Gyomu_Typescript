import { analyzeVariable } from './symbol/variable/analyzeVariable.js'

import type { StatementAnalysisArgument, StatementAnalysisResult } from './types.js'
import type { VariableStatement } from 'ts-morph'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a TypeScript variable statement to identify exported members and captured symbols.
 *
 * @param statement The TypeScript variable statement to analyze.
 *
 * @param args The context and configuration required for the analysis.
 *
 * @returns A result object containing information about exported members and identified symbols found in the statement.
 */
export const analyzeVariableStatement = (
  statement: VariableStatement,
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

  const isExported = statement.isExported()
  // const isDefault = Node.isDefaultClause(statement)
  let variables = statement.getDeclarationList().getDeclarations()
  if (variables.length == 0) variables = statement.getDeclarations()
  for (const variable of variables) {
    const variableResult = analyzeVariable({
      declaration: variable,
      sourceRelativePath,
      declarationOrder,
      memberPath,
      metadata,
      sourceFullText,
      imported,
      options,
      registerSymbol: true,
    })
    if (isExported) {
      result.exported.push({
        kind: 'local',
        exportedName: variableResult.isDefault ? '$default' : variable.getName(),
        isTypeOnly: false,
        isDefault: variableResult.isDefault,
        identity: variableResult.symbol.identity,
      })
    }
    result.symbols.push(variableResult.symbol)
  }

  return result
}
