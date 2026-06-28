import { Node, SyntaxKind } from 'ts-morph'
import { analyzeStatement } from '../analyzers/analyzeStatement.js'
import { analyzeExportStatement } from '../analyzers/analyzeExportStatement.js'
import { analyzeImportStatement } from '../analyzers/analyzeImportStatement.js'
import type { ExportAnalysis, ImportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
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
  const memberPath: Array<string> = []
  const sourceFullText = context.sourceFile.getFullText()

  statements.forEach((statement, declarationOrder) => {
    if (Node.isImportDeclaration(statement)) {
      imported.push(analyzeImportStatement(statement))
    }
  })

  statements.forEach((statement, declarationOrder) => {
    let isDefault = false
    if (Node.isDefaultClause(statement)) isDefault = true

    if (Node.isModifierable(statement)) {
      if (statement.getModifiers().find((m) => m.getKind() == SyntaxKind.DefaultKeyword))
        isDefault = true
    }

    const declaration = statement

    // const sourceFullText = declaration.getFullText()

    // console.log(declaration.getText(), isExported, isDefault)

    const result = analyzeStatement(declaration, {
      metadata,
      memberPath,
      declarationOrder,
      sourceFullText,
      sourceRelativePath,
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
