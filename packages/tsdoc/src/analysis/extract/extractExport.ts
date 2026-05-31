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
    for (const [name, declarations] of context.sourceFile.getExportedDeclarations()) {
      const analysisResult = toExportAnalysis(name, declarations, context.path, metadata, option)
      result.push(...analysisResult)
    }
    return result
  })

const toExportAnalysis = (
  name: string,
  declarations: Array<ExportedDeclarations>,
  sourceFilePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  option?: AnalysisOptions,
): ReadonlyArray<ExportAnalysis> => {
  const results: Array<ExportAnalysis> = []
  for (const declaration of declarations) {
    const analysisResult = analyzeExportedDeclaration(
      name,
      declaration,
      sourceFilePath,
      metadata,
      option,
    )
    if (!analysisResult) continue
    results.push(analysisResult)
  }
  return results
}
