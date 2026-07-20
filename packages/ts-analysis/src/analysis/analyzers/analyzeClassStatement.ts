import { analyzeClass } from './symbol/class/analyzeClass.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/schemas/typescript'
import type { StatementAnalysisArgument, StatementAnalysisResult } from './types.js'
import type { ClassDeclaration } from 'ts-morph'

export const analyzeClassStatement = (
  statement: ClassDeclaration,
  args: StatementAnalysisArgument,
): StatementAnalysisResult => {
  const result = {
    // kind: 'single',
    exported: new Array<ExportAnalysis>(),
    symbols: new Array<SymbolAnalysis>(),
    // dependencies: new Array<DependencyRequirement>(),
  } satisfies StatementAnalysisResult
  const {
    metadata,
    sourceRelativePath,
    memberPath,
    sourceFullText,
    declarationOrder,
    imported,
    options,
  } = args

  const classResult = analyzeClass({
    declaration: statement,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    declarationOrder,
    options,
  })
  if (classResult.isExported) {
    result.exported.push({
      kind: 'local',
      exportedName: classResult.isDefault ? '$default' : (statement.getName() ?? ''),
      isTypeOnly: false,
      isDefault: classResult.isDefault,
      identity: classResult.symbol.identity,
    })
  }
  result.symbols.push(classResult.symbol)

  return result
}
