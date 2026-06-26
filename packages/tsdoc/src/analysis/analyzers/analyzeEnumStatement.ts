import { withOptional } from '@gyomu/schema'
import { analyzeEnum } from './symbol/analyzeEnum.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { StatementAnalysisResult } from './types.js'
import type { EnumDeclaration } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../AnalysisOption.js'

export const analyzeEnumStatement = (
  statement: EnumDeclaration,
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

  const enumResult = analyzeEnum(
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
