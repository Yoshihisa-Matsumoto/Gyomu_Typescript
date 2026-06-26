import { withOptional } from '@gyomu/schema'
import type { ImportAnalysis } from '@gyomu/schema/typescript'
import type { ImportDeclaration } from 'ts-morph'

export const analyzeImportStatement = (statement: ImportDeclaration): ImportAnalysis => {
  return {
    moduleSpecifier: statement.getModuleSpecifierValue(),
    ...withOptional({
      defaultImport: statement.getDefaultImport()?.getText(),
      namespaceImport: statement.getNamespaceImport()?.getText(),
    }),
    namedImports: statement.getNamedImports().map((s) => ({
      importedName: s.getName(),
      localName: s.getAliasNode()?.getText() ?? s.getName(),
      isTypeOnly: statement.isTypeOnly() ? statement.isTypeOnly() : s.isTypeOnly(),
    })),
  }
}
