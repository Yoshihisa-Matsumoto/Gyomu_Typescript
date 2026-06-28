import { withOptional } from '@gyomu/schema'
import { analyzeClass } from './symbol/class/analyzeClass.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { StatementAnalysisResult } from './types.js'
import type { ClassDeclaration } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../AnalysisOption.js'

export const analyzeClassStatement = (
  statement: ClassDeclaration,
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
    // kind: 'single',
    exported: new Array<ExportAnalysis>(),
    symbols: new Array<SymbolAnalysis>(),
    // dependencies: new Array<DependencyRequirement>(),
  } satisfies StatementAnalysisResult
  const { metadata, sourceRelativePath, memberPath, sourceFullText, declarationOrder, options } =
    args

  const classResult = analyzeClass(
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
