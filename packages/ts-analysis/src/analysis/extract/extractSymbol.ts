import { Node } from 'ts-morph'
import { analyzeStatement } from '../analyzers/analyzeStatement.js'
import { analyzeExportStatement } from '../analyzers/analyzeExportStatement.js'
import { analyzeImportStatement } from '../analyzers/analyzeImportStatement.js'
import type { ExportAnalysis, ImportAnalysis } from '@gyomu/schema/schemas/typescript'
import type { MemberIdentityMemberPath, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { AnalysisOptions } from '../AnalysisOption.js'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { SourceFileContext } from '../file/SourceFileContext.js'

export const extractSymbols = (
  context: SourceFileContext,
  metadata: FileAnalysisMetadata,
  options?: AnalysisOptions,
) => {
  const statements = context.sourceFile.getStatements()
  const imported: Array<ImportAnalysis> = []
  const exported: Array<ExportAnalysis> = []
  const symbols: Array<SymbolAnalysis> = []
  const sourceRelativePath = context.path
  const memberPath: MemberIdentityMemberPath = []
  const sourceFullText = context.sourceFile.getFullText()

  statements.forEach((statement, declarationOrder) => {
    if (Node.isImportDeclaration(statement)) {
      imported.push(...analyzeImportStatement(statement))
    }
  })

  // Non export statement start analysis first
  statements.forEach((statement, declarationOrder) => {
    const declaration = statement
    if (Node.isExportable(declaration) && declaration.isExported()) return

    const result = analyzeStatement(declaration, {
      metadata,
      memberPath,
      declarationOrder,
      sourceFullText,
      sourceRelativePath,
      imported,
      options,
    })
    if (result) {
      exported.push(...result.exported)
      symbols.push(...result.symbols)
    }
  })

  // exportable statement later
  statements.forEach((statement, declarationOrder) => {
    const declaration = statement
    if (Node.isExportable(declaration) && !declaration.isExported()) return

    const result = analyzeStatement(declaration, {
      metadata,
      memberPath,
      declarationOrder,
      sourceFullText,
      sourceRelativePath,
      imported,
      options,
    })
    if (result) {
      exported.push(...result.exported)
      symbols.push(...result.symbols)
    }
  })

  statements.forEach((statement, declarationOrder) => {
    if (Node.isExportDeclaration(statement)) {
      const result = analyzeExportStatement(
        statement,
        { exported, symbols: symbols },
        {
          metadata,
          memberPath,
          declarationOrder,
          sourceFullText,
          sourceRelativePath,
          options,
        },
      )

      exported.push(...result.exported)
      symbols.push(...result.symbols)
    }
  })

  return { imported, exported, internals: symbols }
}
