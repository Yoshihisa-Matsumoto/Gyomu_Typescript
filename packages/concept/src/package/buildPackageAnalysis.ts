import { dirname } from 'node:path'
import { listTypescriptProject } from '@gyomu/ts-analysis'
import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { ConceptError } from '../error/ConceptError.js'
import { loadDirectoryConcept } from '../directory/internal/loadDirectoryConcept.js'
import { collectDependencies } from './internal/collectDependencies.js'
import { resolvePackageExportTargets } from './internal/resolvePackageExportTargets.js'
import { findSourceFiles } from './internal/findSourceFiles.js'
import { buildPackageExportAnalysisResult } from './internal/buildPackageExportAnalysisResult.js'
import type { FileSystem } from 'effect'
import type { DirectoryAnalysis, FileSummary, PackageAnalysis } from '@gyomu/schema/concept'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { FileSearchService } from '@gyomu/schema/shared/fs'
import type { PackageExportAnalysisResult } from './internal/types.js'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'
import type { ConceptOptions } from '../ConceptOptions.js'

export const buildPackageAnalysis = (
  context: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<PackageAnalysis, ConceptError, FileSystem.FileSystem | FileSearchService> =>
  Effect.gen(function* () {
    const workspace = yield* listTypescriptProject(context.projectRoot)
    const compilerOptions = context.project.getCompilerOptions()
    const exportTarget = resolvePackageExportTargets(
      context.packageJson.exports,
      { outDir: compilerOptions.outDir, rootDir: compilerOptions.rootDir },
      context.projectRoot,
    )

    const exportResult = yield* Effect.forEach(exportTarget, (target) =>
      findSourceFiles(context.projectRoot, target).pipe(
        Effect.flatMap((resolvedSourceFile) =>
          buildPackageExportAnalysisResult(resolvedSourceFile, context),
        ),
      ),
    )
    const aggregateResult = yield* aggregateFileAndLoadDirectory(context, exportResult, option)

    return {
      dependencies: collectDependencies(context, workspace),
      directories: aggregateResult.directories,
      exportedFiles: aggregateResult.files,
      exports: exportResult.map((e) => e.exports),
      package: {
        name: context.packageJson.name,
        private: context.packageJson.private,
        version: context.packageJson.version,
        description: context.packageJson.description,
        type: context.packageJson.moduleType,
      },
    } satisfies PackageAnalysis
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, () => ({
        packageName: context.projectName,
        phase: 'context-build' as const,
        filePath: context.projectRoot,
        message: 'fail to build package analysis',
      })),
    ),
  )

const aggregateFileAndLoadDirectory = (
  context: ProjectContext,
  exportResult: Array<PackageExportAnalysisResult>,
  option?: ConceptOptions,
) => {
  // const files = exportResult.map((exp) => exp.files).flat()
  const filePathSet = new Map<string, FileSummary>()
  // const dirPathSet = new Map<string, DirectoryConcept>()
  const dirPathFactSet = new Map<
    string,
    {
      publicApiSymbols: Set<string>
      rootApiSymbols: Set<string>
      concept: DirectoryConcept
    }
  >()

  return Effect.gen(function* () {
    yield* Effect.forEach(exportResult, (exp) =>
      Effect.gen(function* () {
        const exportPath = exp.exports.exportPath
        const isRootExportPath = exportPath == '.'

        yield* Effect.forEach(exp.files, (fileSummary) =>
          Effect.gen(function* () {
            if (filePathSet.has(fileSummary.path)) {
              return Effect.void
            }
            filePathSet.set(fileSummary.path, fileSummary)
            const directory = ProjectRelativePath(dirname(fileSummary.path))

            if (!dirPathFactSet.has(directory)) {
              const directoryConcept = yield* loadDirectoryConcept(context, directory, option)

              if (directoryConcept)
                dirPathFactSet.set(directory, {
                  concept: directoryConcept,
                  publicApiSymbols: new Set<string>(),
                  rootApiSymbols: new Set<string>(),
                })
            }
            const entry = dirPathFactSet.get(directory)
            if (entry) {
              const targetExportSymbols = exp.exports.exportedSymbols
                .filter((sym) => dirname(sym.sourceFile) == directory)
                .map((sym) => sym.name)
              targetExportSymbols.forEach((symName) => {
                entry.publicApiSymbols.add(symName)
                if (isRootExportPath) entry.rootApiSymbols.add(symName)
              })
            }
          }),
        )
      }),
    )

    // yield* Effect.forEach(files, (fileSummary) =>
    //       Effect.gen(function* () {
    //         if (filePathSet.has(fileSummary.path)) {
    //           return Effect.void
    //         }
    //         filePathSet.set(fileSummary.path, fileSummary)
    //         const directory = ProjectRelativePath(dirname(fileSummary.path))

    //         if (dirPathSet.has(directory)) {
    //           return Effect.void
    //         }

    //         const directoryConcept = yield* loadDirectoryConcept(context, directory, option)

    //         if (directoryConcept) dirPathSet.set(directory, directoryConcept)
    //       }),
    //     )

    const dirList = dirPathFactSet
      .entries()
      .map(
        ([path, entry]: [
          string,
          {
            publicApiSymbols: Set<string>
            rootApiSymbols: Set<string>
            concept: DirectoryConcept
          },
        ]) =>
          ({
            path: ProjectRelativePath(path),
            facts: {
              publicApiSymbolCount: entry.publicApiSymbols.size,
              rootApiSymbolCount: entry.rootApiSymbols.size,
            },
            concept: entry.concept,
          }) satisfies DirectoryAnalysis,
      )
      .toArray()

    return {
      files: filePathSet.values().toArray(),
      directories: dirList,
    }
  })
}
