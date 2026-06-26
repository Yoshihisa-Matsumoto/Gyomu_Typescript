import { Node } from 'ts-morph'
import { analyzeVariableStatement } from './analyzeVariableStatement.js'
import { analyzeClassStatement } from './analyzeClassStatement.js'
import { analyzeFunctionStatement } from './analyzeFunctionStatement.js'
import { analyzeInterfaceStatement } from './analyzeInterfaceStatement.js'
import { analyzeEnumStatement } from './analyzeEnumStatement.js'
import { analyzeTypeAliasStatement } from './analyzeTypeAliasStatement.js'
import type { Statement } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../AnalysisOption.js'
import type { StatementAnalysisResult } from './types.js'

export const analyzeStatement = (
  statement: Statement,
  args: {
    metadata: FileAnalysisMetadata
    sourceRelativePath: string
    memberPath: Array<string>
    sourceFullText: string
    declarationOrder: number
    options: AnalysisOptions | undefined
  },
): StatementAnalysisResult | undefined => {
  if (Node.isVariableStatement(statement)) return analyzeVariableStatement(statement, args)
  if (Node.isClassDeclaration(statement)) return analyzeClassStatement(statement, args)
  if (Node.isFunctionDeclaration(statement)) return analyzeFunctionStatement(statement, args)
  if (Node.isInterfaceDeclaration(statement)) return analyzeInterfaceStatement(statement, args)
  if (Node.isEnumDeclaration(statement)) return analyzeEnumStatement(statement, args)
  if (Node.isTypeAliasDeclaration(statement)) return analyzeTypeAliasStatement(statement, args)

  return undefined
}
