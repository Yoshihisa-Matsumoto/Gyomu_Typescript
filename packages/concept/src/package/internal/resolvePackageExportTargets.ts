import { mapOutputPathToSourcePath } from '@gyomu/ts-analysis'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { PackageExportEntry } from '@gyomu/schema/typescript'
import type { FullPath } from '@gyomu/schema'
import type { ResolvedPackageExport } from './types.js'
// import type { PackageExportAnalysis } from '@gyomu/schema/concept'

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
