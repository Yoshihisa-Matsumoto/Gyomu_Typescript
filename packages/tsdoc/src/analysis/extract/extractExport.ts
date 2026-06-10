import { fromSync } from '@gyomu/schema/effect'

import { AnalysisError } from '../error/AnalysisError.js'

import { analyzeExportedDeclaration } from '../analyzers/analyzeExportedDeclaration.js'
import type { SourceFileContext } from '../file/SourceFileContext.js'
import type { ExportAnalysis } from '../symbol/ExportAnalysis.js'
import type { ExportedDeclarations } from 'ts-morph'
import type { AnalysisOptions } from '../AnalysisOption.js'
import type { ProjectRelativePath } from '../types.js'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'

export const extractExport = (
  context: SourceFileContext,
  metadata: FileAnalysisMetadata,
  option?: AnalysisOptions,
) =>
  fromSync(AnalysisError, () => ({
    filePath: context.path,
    phase: 'export-extract' as const,
    message: 'fail to extract export',
  }))(() => {
    const result: Array<ExportAnalysis> = []
    const sourceFullText = context.sourceFile.getFullText()

    const map = context.sourceFile.getExportedDeclarations()
    map.keys().forEach((name, index) => {
      const declarations = map.get(name)!
      const analysisResult = toExportAnalysis(
        name,
        declarations,
        context.path,
        metadata,
        sourceFullText,
        index,
        option,
      )
      result.push(...analysisResult)
    })
    return result
  })

const toExportAnalysis = (
  name: string,
  declarations: Array<ExportedDeclarations>,
  sourceFilePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  sourceFullText: string,
  declarationOrder: number,
  option?: AnalysisOptions,
): ReadonlyArray<ExportAnalysis> => {
  const results: Array<ExportAnalysis> = []
  for (const declaration of declarations) {
    const analysisResult = analyzeExportedDeclaration(
      name,
      declaration,
      sourceFilePath,
      metadata,
      sourceFullText,
      declarationOrder,
      option,
    )
    if (!analysisResult) continue
    results.push(analysisResult)
  }
  return results
}
