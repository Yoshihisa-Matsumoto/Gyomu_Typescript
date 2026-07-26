import { loadFileAnalysisResult, mapModuleSpecifierToSourcePath } from '@gyomu/ts-analysis'
import { Effect } from 'effect'
import { buildFileSummaryRecord } from '../../directory/internal/buildFileSummaryRecord.js'
import type { AnalysisOptions } from '@gyomu/schema'
import type { FileAnalysisContext, ProjectRelativePath } from '@gyomu/schema/typescript'
import type { AnalysisError, ProjectContext } from '@gyomu/ts-analysis'
import type { FileSystem } from 'effect'
import type { PackageExportAnalysisResult, ResolvedSourceFile } from './types.js'
import type { ExportedSymbolAnalysis, FileSummary } from '@gyomu/schema/concept'

export const buildPackageExportAnalysisResult = (
  exportInfo: ResolvedSourceFile,
  context: ProjectContext,
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
        exportedSymbols: aggregateExports(result.map((r) => r.exports).flat()),
      },
    }
  })

const aggregateExports = (
  exports: Array<ExportedSymbolAnalysis>,
): Array<ExportedSymbolAnalysis> => {
  return [...new Map(exports.map((item) => [`${item.sourceFile}:${item.name}`, item])).values()]
}

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
      exports: sourceSummary.exports.map((exp) => {
        return {
          sourceFile: sourceSummary.path,
          kind: exp.kind,
          name: exp.symbol,
          summary: exp,
        } satisfies ExportedSymbolAnalysis
      }),
    }
    result.push(sourceExportResult)

    const mapModuleSymbols = new Map<string, Array<string>>()
    for (const reexport of sourceSummary.reExports) {
      const module = reexport.module
      if (!reexport.exportAll) {
        if (!mapModuleSymbols.has(module)) mapModuleSymbols.set(module, new Array<string>())
        const targets = mapModuleSymbols.get(module)!
        targets.push(reexport.symbol)
        // console.log(`export specific:${reexport.symbol}`)
      }
    }

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
      const remainigTarget = mapModuleSymbols.get(reexport.module)

      if (remainigTarget) {
        const tobeDeleted: Array<string> = []
        for (const expModule of reExportModule) {
          const filtered = expModule.exports.filter((e) => remainigTarget.includes(e.name))
          expModule.exports = filtered
          if (filtered.length == 0) tobeDeleted.push(expModule.file.path)
        }

        for (const item of tobeDeleted) {
          const index = reExportModule.findIndex((x) => x.file.path == item)
          if (index !== -1) {
            reExportModule.splice(index, 1)
          }
        }
      }
      result.push(...reExportModule)
    }
    return result
  })
