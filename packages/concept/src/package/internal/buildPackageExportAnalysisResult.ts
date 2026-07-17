import { loadFileAnalysisResult, mapModuleSpecifierToSourcePath } from '@gyomu/ts-analysis'
import { Effect } from 'effect'
import { buildFileSummaryRecord } from '../../directory/internal/buildFileSummaryRecord.js'
import type { AnalysisOptions } from '@gyomu/schema'
import type { FileAnalysisContext, ProjectRelativePath } from '@gyomu/schema/typescript'
import type { AnalysisError, ProjectContext } from '@gyomu/ts-analysis'
import type { FileSystem } from 'effect'
import type { PackageExportAnalysisResult, ResolvedSourceFile } from './types.js'
import type { ExportedSymbolAnalysis, FileSummary } from '@gyomu/schema/concept'

export const buildPackageExportAnalysis = (
  context: ProjectContext,
  exportInfo: ResolvedSourceFile,
  option?: AnalysisOptions,
): Effect.Effect<PackageExportAnalysisResult, AnalysisError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const result = (yield* Effect.forEach(exportInfo.sourceFiles, (sourceFile) =>
      analyzeSourceFile(context, sourceFile, option),
    )).flat()
    return {
      files: result.map((r) => r.file),
      exports: {
        exportPath: exportInfo.exportPath,
        exportedSymbols: result.map((r) => r.exports).flat(),
      },
    }
  })

type SourceExportResult = {
  file: FileSummary
  exports: Array<ExportedSymbolAnalysis>
}

const analyzeSourceFile = (
  context: ProjectContext,
  sourceFile: ProjectRelativePath,
  option?: AnalysisOptions,
): Effect.Effect<Array<SourceExportResult>, AnalysisError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const sourceResult = yield* loadFileAnalysisResult(context, sourceFile, option)
    const sourceSummary = buildFileSummaryRecord(sourceResult.result)
    const result: Array<SourceExportResult> = []
    const mapExportFiles = new Map<
      ProjectRelativePath,
      { context: FileAnalysisContext; summary: FileSummary }
    >()
    const reExportModule = yield* analyzeExportModules(
      sourceSummary,
      context,
      mapExportFiles,
      option,
    )
    result.push(...reExportModule)

    return result
  })

const analyzeExportModules = (
  sourceSummary: FileSummary,
  context: ProjectContext,
  mapExportFiles: Map<ProjectRelativePath, { context: FileAnalysisContext; summary: FileSummary }>,
  option?: AnalysisOptions,
): Effect.Effect<Array<SourceExportResult>, AnalysisError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const result: Array<SourceExportResult> = []
    const sourceExportResult: SourceExportResult = {
      file: sourceSummary,
      exports: sourceSummary.exports.map(
        (exp) =>
          ({
            sourceFile: sourceSummary.path,
            kind: exp.kind,
            name: exp.symbol,
            summary: exp,
          }) satisfies ExportedSymbolAnalysis,
      ),
    }
    result.push(sourceExportResult)
    for (const reexport of sourceSummary.reExports) {
      const modulePath = mapModuleSpecifierToSourcePath(reexport.module, sourceSummary.path)
      if (!modulePath) continue

      if (!mapExportFiles.has(modulePath)) {
        // console.log(modulePath)
        const moduleResult = yield* loadFileAnalysisResult(context, modulePath, option)
        const moduleSummary = buildFileSummaryRecord(moduleResult.result)
        mapExportFiles.set(modulePath, { context: moduleResult.result, summary: moduleSummary })
      } else continue
      const module = mapExportFiles.get(modulePath)!

      const reExportModule = yield* analyzeExportModules(
        module.summary,
        context,
        mapExportFiles,
        option,
      )
      result.push(...reExportModule)
    }
    return result
  })
