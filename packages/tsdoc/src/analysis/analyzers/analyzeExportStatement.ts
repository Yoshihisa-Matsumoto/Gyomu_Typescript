import { Node } from 'ts-morph'
import { moduleSpecifierToSourcePath } from '../../shared/module/moduleSpecifierToSourcePath.js'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { ExportAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { StatementAnalysisResult } from './types.js'
import type { ExportDeclaration } from 'ts-morph'
import type { AnalysisOptions } from '../AnalysisOption.js'

export const analyzeExportStatement = (
  statement: ExportDeclaration,
  fileSymbols: {
    exported: Array<ExportAnalysis>
    symbols: Array<SymbolAnalysis>
  },
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
    // dependencyRequirements: new Map<string, Array<DependencyRequirement>>(),
  } satisfies StatementAnalysisResult

  const isDefault = Node.isDefaultClause(statement)
  const module = statement.getModuleSpecifier()

  const isTypeAll = statement.isTypeOnly()

  const namedExport = statement.getChildren().find((c) => Node.isNamedExports(c))
  if (namedExport) {
    for (const exportSpecifier of namedExport.getElements()) {
      console.log(exportSpecifier.getName())
      const propertyNamed = exportSpecifier.getNodeProperty('propertyName')
      const exportName = exportSpecifier.getNodeProperty('name').getText()
      const isTyped = exportSpecifier.isTypeOnly()

      let referencedNodeName: string
      if (propertyNamed) {
        referencedNodeName = propertyNamed.getText()
      } else {
        referencedNodeName = exportSpecifier.getText()
      }
      if (!module) {
        const targetSymbol = fileSymbols.symbols.find(
          (s) => s.identity.symbolId == referencedNodeName,
        )
        if (targetSymbol) {
          const referencedSymbol: SymbolAnalysis = { ...targetSymbol }
          referencedSymbol.location = {
            startLine: statement.getStartLineNumber(),
            endLine: statement.getEndLineNumber(),
          }
          referencedSymbol.startOffset = statement.getStart()
          referencedSymbol.snippet = statement.getFullText()
          result.exported.push({
            kind: 'local',
            identity: referencedSymbol.identity,
            isTypeOnly: isTypeAll || isTyped,
            isDefault,
            exportedName: isDefault ? '$default' : exportName,
          })
        }
      } else {
        const fromModule = module.getText()
        const exportName = referencedNodeName
        // Graph (non within file)
        if (fromModule.startsWith('.')) {
          // within the project
          const moduleSpecifier = moduleSpecifierToSourcePath(fromModule, args.sourceRelativePath)
          result.exported.push({
            kind: 're-export',
            exportAll: true,
            isTypeOnly: isTypeAll,
            exportedName: isDefault ? '$default' : exportName,
            moduleSpecifier,
          })
        } else {
          result.exported.push({
            kind: 're-export',
            exportAll: true,
            isTypeOnly: isTypeAll,
            exportedName: isDefault ? '$default' : exportName,
            moduleSpecifier: fromModule,
          })
        }
      }
    }
  }

  const namespaceExport = statement.getChildren().find((c) => Node.isNamespaceExport(c))
  if (namespaceExport) {
    if (module) {
      const fromModule = module.getText()
      const exportName = namespaceExport.getName()
      // Graph (non within file)
      if (fromModule.startsWith('.')) {
        // within the project
        const moduleSpecifier = moduleSpecifierToSourcePath(fromModule, args.sourceRelativePath)
        result.exported.push({
          kind: 're-export',
          exportAll: true,
          isTypeOnly: isTypeAll,
          exportedName: isDefault ? '$default' : exportName,
          moduleSpecifier,
        })
      } else {
        result.exported.push({
          kind: 're-export',
          exportAll: true,
          isTypeOnly: isTypeAll,
          exportedName: isDefault ? '$default' : exportName,
          moduleSpecifier: fromModule,
        })
      }
    }
  }

  if (module) {
    let isAsterisk = false
    if (Node.isGeneratorable(statement) && statement.getAsteriskToken()) {
      isAsterisk = true
    }
    if (!isAsterisk) {
      const generator = statement.getChildren().find((c) => Node.isGeneratorable(c))
      if (generator && generator.getAsteriskToken()) isAsterisk = true
    }
    if (isAsterisk) {
      const fromModule = module.getText()
      // Graph (non within file)
      if (fromModule.startsWith('.')) {
        // within the project
        const moduleSpecifier = moduleSpecifierToSourcePath(fromModule, args.sourceRelativePath)
        result.exported.push({
          kind: 're-export',
          exportAll: true,
          isTypeOnly: isTypeAll,
          exportedName: isDefault ? '$default' : module.getText(),
          moduleSpecifier,
        })
      } else {
        result.exported.push({
          kind: 're-export',
          exportAll: true,
          isTypeOnly: isTypeAll,
          exportedName: isDefault ? '$default' : module.getText(),
          moduleSpecifier: fromModule,
        })
      }
    }
  }

  return result
}
