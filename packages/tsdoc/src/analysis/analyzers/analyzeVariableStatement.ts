import { withOptional } from '@gyomu/schema'
import { analyzeVariable } from './symbol/variable/analyzeVariable.js'
import type {
  DependencyRequirement,
  ExportAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/typescript'
import type { StatementAnalysisResult } from './types.js'
import type { VariableStatement } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../AnalysisOption.js'

export const analyzeVariableStatement = (
  statement: VariableStatement,
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
      name: variable.getName(),
      ...withOptional({ options }),
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
