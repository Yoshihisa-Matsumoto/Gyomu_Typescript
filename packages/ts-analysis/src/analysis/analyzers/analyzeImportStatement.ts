import type { ImportAnalysis } from '@gyomu/schema/schemas/typescript'
import type { ImportDeclaration } from 'ts-morph'

/**
 * Analyzes an ImportDeclaration to extract metadata about imports, identifying default, namespace, or named import types.
 *
 * @param statement The import declaration node to analyze.
 *
 * @returns An array of ImportAnalysis objects detailing each imported identifier.
 */
export const analyzeImportStatement = (statement: ImportDeclaration): Array<ImportAnalysis> => {
  const defaultImport = statement.getDefaultImport()
  const namespaceImport = statement.getNamespaceImport()

  if (defaultImport) {
    return [
      {
        kind: 'default',
        isTypeOnly: statement.isTypeOnly(),
        moduleSpecifier: statement.getModuleSpecifierValue(),
        importedName: defaultImport.getText(),
        localName: defaultImport.getText(),
      },
    ]
  }
  if (namespaceImport) {
    return [
      {
        kind: 'namespace',
        isTypeOnly: statement.isTypeOnly(),
        moduleSpecifier: statement.getModuleSpecifierValue(),
        importedName: namespaceImport.getText(),
        localName: namespaceImport.getText(),
      },
    ]
  }

  return statement.getNamedImports().map((s) => ({
    kind: 'named',
    importedName: s.getName(),
    moduleSpecifier: statement.getModuleSpecifierValue(),
    localName: s.getAliasNode()?.getText() ?? s.getName(),
    isTypeOnly: statement.isTypeOnly() ? true : s.isTypeOnly(),
  }))
}
