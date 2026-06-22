import { Node, SyntaxKind } from 'ts-morph'
import { withOptional } from '@gyomu/schema'
import { analyzeVariableDeclaration } from '../analyzers/symbol/variable/analyzeVariable.js'
import { analyzeClassDeclaration } from '../analyzers/symbol/class/analyzeClass.js'
import { analyzeFunctionDeclaration } from '../analyzers/symbol/analyzeFunction.js'
import { analyzeInterfaceDeclaration } from '../analyzers/symbol/analyzeInterface.js'
import { analyzeEnumDeclaration } from '../analyzers/symbol/analyzeEnum.js'
import { analyzeTypeAliasDeclaration } from '../analyzers/symbol/analyzeTypeAlias.js'
import type { SymbolAnalysis } from '../symbol/SymbolAnalysis.js'
import type { AnalysisOptions } from '../AnalysisOption.js'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { SourceFileContext } from '../file/SourceFileContext.js'
import type { ExportAnalysis } from '../symbol/ExportAnalysis.js'

export const extractSymbols = (
  context: SourceFileContext,
  metadata: FileAnalysisMetadata,
  options?: AnalysisOptions,
) => {
  const symbols = context.sourceFile.getStatements()
  const exported: Array<ExportAnalysis> = []
  const internals: Array<SymbolAnalysis> = []
  const sourceRelativePath = context.path
  const memberPath: Array<string> = []

  console.log(symbols.length)
  symbols.forEach((statement, declarationOrder) => {
    let isExported = false
    let isDefault = false
    if (Node.isExportable(statement)) isExported = statement.isExported()
    if (Node.isExportDeclaration(statement)) isExported = true

    if (Node.isDefaultClause(statement)) isDefault = true

    if (Node.isModifierable(statement)) {
      if (statement.getModifiers().find((m) => m.getKind() == SyntaxKind.DefaultKeyword))
        isDefault = true
    }

    const declaration = statement

    const sourceFullText = declaration.getFullText()

    console.log(declaration.getText(), isExported, isDefault)

    if (Node.isVariableStatement(declaration)) {
      let variables = declaration.getDeclarationList().getDeclarations()
      if (variables.length == 0) variables = declaration.getDeclarations()
      for (const variable of variables) {
        const variableResult = analyzeVariableDeclaration({
          declaration: variable,
          sourceRelativePath,
          declarationOrder,
          memberPath,
          metadata,
          sourceFullText: variable.getFullText(),
          name: variable.getName(),
          ...withOptional({ options }),
        })
        if (isExported) {
          exported.push({
            exportedName: isDefault ? 'default' : variable.getName(),
            isTypeOnly: false,
            ...variableResult,
          })
        } else internals.push(variableResult.symbol)
      }
    }
    if (Node.isClassDeclaration(declaration)) {
      const classResult = analyzeClassDeclaration(
        withOptional({
          declaration,
          options,
          sourceRelativePath,
          metadata,
          memberPath,
          sourceFullText,

          declarationOrder,
        }),
      )
      if (isExported) {
        exported.push({
          exportedName: isDefault ? 'default' : (declaration.getName() ?? ''),
          isTypeOnly: false,
          ...classResult,
        })
      } else internals.push(classResult.symbol)
    }
    if (Node.isFunctionDeclaration(declaration)) {
      const functionResult = analyzeFunctionDeclaration(
        withOptional({
          declaration,
          options,
          sourceRelativePath,
          metadata,
          memberPath,
          sourceFullText,

          declarationOrder,
        }),
      )
      if (isExported) {
        exported.push({
          exportedName: isDefault ? 'default' : (declaration.getName() ?? ''),
          isTypeOnly: false,
          ...functionResult,
        })
      } else internals.push(functionResult.symbol)
    }
    if (Node.isInterfaceDeclaration(declaration)) {
      const interfaceResult = analyzeInterfaceDeclaration(
        withOptional({
          declaration,
          options,
          sourceRelativePath,
          metadata,
          memberPath,
          sourceFullText,

          declarationOrder,
        }),
      )
      if (isExported) {
        exported.push({
          ...interfaceResult,
          isTypeOnly: true,
          exportedName: isDefault ? 'default' : declaration.getName(),
        })
      } else internals.push(interfaceResult.symbol)
    }
    if (Node.isEnumDeclaration(declaration)) {
      const enumResult = analyzeEnumDeclaration(
        withOptional({
          declaration,
          options,
          sourceRelativePath,
          metadata,
          memberPath,
          sourceFullText,

          declarationOrder,
        }),
      )
      if (isExported) {
        exported.push({
          ...enumResult,
          isTypeOnly: false,
          exportedName: isDefault ? 'default' : declaration.getName(),
        })
      } else internals.push(enumResult.symbol)
    }
    if (Node.isTypeAliasDeclaration(declaration)) {
      const typeResult = analyzeTypeAliasDeclaration(
        withOptional({
          declaration,
          options,
          sourceRelativePath,
          metadata,
          memberPath,
          sourceFullText,

          declarationOrder,
        }),
      )
      if (isExported) {
        exported.push({
          ...typeResult,
          isTypeOnly: true,
          exportedName: isDefault ? 'default' : declaration.getName(),
        })
      } else internals.push(typeResult.symbol)
    }
    if (Node.isExportDeclaration(declaration)) {
      console.log(declaration.getKindName())
      if (!declaration.getModuleSpecifier()) {
        for (const child of declaration.getChildren()) {
          if (Node.isNamedExports(child)) {
            for (const exportSpecifier of child.getElements()) {
              console.log(exportSpecifier.getName())
              const propertyNamed = exportSpecifier.getNodeProperty('propertyName')
              const exportName = exportSpecifier.getNodeProperty('name').getText()

              if (propertyNamed) {
                const referencedNodeName = propertyNamed.getText()
                // このときだけ、Exportsに入れる
                const targetSymbol = internals.find(
                  (s) => s.identity.symbolId == referencedNodeName,
                )
                if (targetSymbol) {
                  const referencedSymbol: SymbolAnalysis = { ...targetSymbol }
                  referencedSymbol.location = {
                    startLine: declaration.getStartLineNumber(),
                    endLine: declaration.getEndLineNumber(),
                  }
                  referencedSymbol.startOffset = declaration.getStart()
                  referencedSymbol.snippet = sourceFullText
                  exported.push({
                    symbol: referencedSymbol,
                    isTypeOnly: false,
                    isDefault,
                    exportedName: isDefault ? 'default' : exportName,
                  })
                }
              }
            }
          }
        }
      }
    }
  })

  return { exported, internals }
}
