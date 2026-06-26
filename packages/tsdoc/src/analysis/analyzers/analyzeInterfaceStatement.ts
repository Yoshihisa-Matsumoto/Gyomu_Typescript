import { withOptional } from '@gyomu/schema'
import { analyzeInterface } from './symbol/analyzeInterface.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { StatementAnalysisResult } from './types.js'
import type { InterfaceDeclaration } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../AnalysisOption.js'

export const analyzeInterfaceStatement = (
  statement: InterfaceDeclaration,
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

  const interfaceResult = analyzeInterface(
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
