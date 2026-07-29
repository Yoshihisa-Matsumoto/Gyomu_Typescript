import { mapOutputPathToSourcePath } from '@gyomu/ts-analysis'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { PackageExportEntry } from '@gyomu/schema/typescript'
import type { FullPath } from '@gyomu/schema'
import type { ResolvedPackageExport } from './types.js'
// import type { PackageExportAnalysis } from '@gyomu/schema/concept'

/**
 * Resolves package export targets to source file paths based on compiler output and root directory settings.
 *
 * @param packageJsonExports The list of package export entries to process.
 *
 * @param compilerOptions The project compiler configuration.
 *
 * @param projectRoot The absolute path to the project root directory.
 *
 * @returns An array of resolved package export information containing export paths and corresponding source files.
 */
export const resolvePackageExportTargets = (
  packageJsonExports: ReadonlyArray<PackageExportEntry>,
  compilerOptions: { rootDir: string | undefined; outDir: string | undefined },
  projectRoot: FullPath,
): Array<ResolvedPackageExport> => {
  const rootDir = compilerOptions.rootDir
  const outDir = compilerOptions.outDir

  const isValidSetting = !!rootDir && !!outDir

  return packageJsonExports
    .map((entry) => {
      const target = entry.targets.find((t) => t.condition == undefined || t.condition == 'import')
      if (!target) return undefined
      if (!isValidSetting) return undefined
      const sourceFile = ProjectRelativePath(
        mapOutputPathToSourcePath(target.target, {
          outDir,
          rootDir,
          packageRootPath: projectRoot,
        }),
      )
      return {
        exportPath: entry.exportPath,
        sourceFile,
      }
    })
    .filter((e) => !!e)
}
