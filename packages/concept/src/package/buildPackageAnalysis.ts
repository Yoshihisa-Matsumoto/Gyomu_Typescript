import { listTypescriptProject } from '@gyomu/ts-analysis'
import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { ConceptError } from '../error/ConceptError.js'
import { collectDependencies } from './internal/collectDependencies.js'
import { resolvePackageExportTargets } from './internal/resolvePackageExportTargets.js'
import { findSourceFiles } from './internal/findSourceFiles.js'
import { buildPackageExportAnalysis } from './internal/buildPackageExportAnalysisResult.js'
import type { FileSystem } from 'effect'
import type { FileSummary, PackageAnalysis } from '@gyomu/schema/concept'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { FileSearchService } from '@gyomu/schema/shared/fs'
import type { PackageExportAnalysisResult } from './internal/types.js'

export const buildPackageAnalysis = (
  context: ProjectContext,
): Effect.Effect<PackageAnalysis, ConceptError, FileSystem.FileSystem | FileSearchService> =>
  Effect.gen(function* () {
    const workspace = yield* listTypescriptProject(context.projectRoot)
    const compilerOptions = context.project.getCompilerOptions()
    const exportTarget = resolvePackageExportTargets(
      context.packageJson.exports,
      { outDir: compilerOptions.outDir, rootDir: compilerOptions.rootDir },
      context.projectRoot,
    )
    const exportedSourceFiles = yield* Effect.forEach(exportTarget, (target) =>
      findSourceFiles(context.projectRoot, target),
    )

    const exportResult = yield* Effect.forEach(exportedSourceFiles, (resolvedSourceFile) =>
      buildPackageExportAnalysis(context, resolvedSourceFile),
    )

    return {
      dependencies: collectDependencies(context, workspace),
      directories: [],
      exportedFiles: [],
      exports: exportResult.map((e) => e.exports),
      package: {
        name: context.packageJson.name,
        private: context.packageJson.private,
        version: context.packageJson.version,
        description: context.packageJson.description,
        type: context.packageJson.moduleType,
      },
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, () => ({
        phase: 'context-build' as const,
        filePath: context.projectRoot,
        message: 'fail to build package analysis',
      })),
    ),
  )

const aggregateFileAndLoadDirectory = (exportResult: Array<PackageExportAnalysisResult>) => {
  const files = exportResult.map((exp) => exp.files).flat()
  const filePathSet = new Map<string, FileSummary>()
  files.forEach((fileSummary) => {
    if (!filePathSet.has(fileSummary.path)) {
      filePathSet.set(fileSummary.path, fileSummary)
    }
  })
}
