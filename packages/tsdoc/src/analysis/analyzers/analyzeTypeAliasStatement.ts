import { withOptional } from '@gyomu/schema'
import { analyzeTypeAlias } from './symbol/analyzeTypeAlias.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { StatementAnalysisResult } from './types.js'
import type { TypeAliasDeclaration } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../AnalysisOption.js'

export const analyzeTypeAliasStatement = (
  statement: TypeAliasDeclaration,
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

  const typeAliasResult = analyzeTypeAlias(
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
