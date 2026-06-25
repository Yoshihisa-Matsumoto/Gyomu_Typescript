import { fromSync } from '@gyomu/schema/effect'

import { withOptional } from '@gyomu/schema'
import { AnalysisError } from '../error/AnalysisError.js'

import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { SourceFileContext } from '../file/SourceFileContext.js'
import type { ImportDeclaration } from 'ts-morph'
import type { AnalysisOptions } from '../AnalysisOption.js'
import type { ImportAnalysis } from '@gyomu/schema/typescript'

export const extractImport = (
  context: SourceFileContext,
  metadata: FileAnalysisMetadata,
  option?: AnalysisOptions,
) =>
  fromSync(AnalysisError, () => ({
    filePath: context.path,
    phase: 'export-extract' as const,
    message: 'fail to extract export',
  }))(() => {
    const result: Array<ImportAnalysis> = []
    for (const declaration of context.sourceFile.getImportDeclarations()) {
      const analysisResult = toImportAnalysis(declaration, metadata, option)
      result.push(analysisResult)
    }
    return result
  })

const toImportAnalysis = (
  declaration: ImportDeclaration,
  metadata: FileAnalysisMetadata,
  option?: AnalysisOptions,
): ImportAnalysis => {
  return {
    moduleSpecifier: declaration.getModuleSpecifierValue(),
    ...withOptional({
      defaultImport: declaration.getDefaultImport()?.getText(),
      namespaceImport: declaration.getNamespaceImport()?.getText(),
    }),
    namedImports: declaration.getNamedImports().map((s) => ({
      importedName: s.getName(),
      localName: s.getAliasNode()?.getText() ?? s.getName(),
      isTypeOnly: declaration.isTypeOnly() ? declaration.isTypeOnly() : s.isTypeOnly(),
    })),
  }
}
