import { Node, SyntaxKind } from 'ts-morph'
import { moduleSpecifierToSourcePath } from '../../shared/module/moduleSpecifierToSourcePath.js'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type {
  ExportAnalysis,
  MemberIdentityMemberPath,
  SymbolAnalysis,
} from '@gyomu/schema/typescript'
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
    memberPath: MemberIdentityMemberPath
    sourceFullText: string
    declarationOrder: number
    options: AnalysisOptions | undefined
  },
): StatementAnalysisResult => {
  const result = {
    // kind: 'none',
    exported: new Array<ExportAnalysis>(),
    symbols: new Array<SymbolAnalysis>(),
    // dependencyRequirements: new Map<string, Array<DependencyRequirement>>(),
  } satisfies StatementAnalysisResult

  const isDefault = Node.isDefaultClause(statement)
  const module = statement.getModuleSpecifier()

  const isTypeAll = statement.isTypeOnly()

  const statementChildren = statement.getChildren()

  const namedExport = statementChildren.find((c) => Node.isNamedExports(c))
  if (namedExport) {
    for (const exportSpecifier of namedExport.getElements()) {
      console.log(exportSpecifier.getName())
      const propertyNamed = exportSpecifier.getNodeProperty('propertyName')
      const children = exportSpecifier.getChildren()
      const asIndex = children.findIndex((c) => c.getKind() == SyntaxKind.AsKeyword)
      const aliasName = asIndex >= 0 ? (children[asIndex + 1]?.getText() ?? undefined) : undefined

      const typeKeywordIndex = children.findIndex((c) => c.getKind() == SyntaxKind.TypeKeyword)
      const isTyped = exportSpecifier.isTypeOnly() || typeKeywordIndex >= 0

      let referencedNodeName: string | undefined
      if (propertyNamed) {
        referencedNodeName = propertyNamed.getText()
      }

      if (!referencedNodeName || referencedNodeName == '')
        referencedNodeName = exportSpecifier.getName()
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
            exportedName: isDefault ? '$default' : (aliasName ?? referencedNodeName),
          })
        }
      } else {
        const fromModule = module.getText()

        // Graph (non within file)
        if (fromModule.startsWith('.')) {
          // within the project
          const moduleSpecifier = moduleSpecifierToSourcePath(fromModule, args.sourceRelativePath)
          result.exported.push({
            kind: 're-export',
            exportAll: false,
            isTypeOnly: isTypeAll || isTyped,
            exportedName: isDefault ? '$default' : (aliasName ?? referencedNodeName),
            moduleSpecifier,
          })
        } else {
          result.exported.push({
            kind: 're-export',
            exportAll: false,
            isTypeOnly: isTypeAll || isTyped,
            exportedName: isDefault ? '$default' : (aliasName ?? referencedNodeName),
            moduleSpecifier: fromModule,
          })
        }
      }
    }
  }

  const namespaceExport = statementChildren.find((c) => Node.isNamespaceExport(c))
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

  if (!namedExport && !namespaceExport) {
    if (module) {
      let isAsterisk = false

      if (Node.isGeneratorable(statement) && statement.getAsteriskToken()) {
        isAsterisk = true
      }

      const asteriskToken = statementChildren.find((c) => c.getKind() == SyntaxKind.AsteriskToken)
      if (asteriskToken) isAsterisk = true

      if (!isAsterisk) {
        const generator = statementChildren.find((c) => Node.isGeneratorable(c))
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
            exportedName: isDefault ? '$default' : '$*',
            moduleSpecifier,
          })
        } else {
          result.exported.push({
            kind: 're-export',
            exportAll: true,
            isTypeOnly: isTypeAll,
            exportedName: isDefault ? '$default' : '$*',
            moduleSpecifier: fromModule,
          })
        }
      }
    }
  }

  return result
}
