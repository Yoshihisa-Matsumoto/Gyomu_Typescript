import { join } from 'node:path'
import { wrapInfraError } from '@gyomu/schema'
import { Effect } from 'effect'
import { readStringFromFile } from '@gyomu/infra/fs'
import { getSupportedDependencyKind } from '@gyomu/schema/typescript'
import { fromSync } from '@gyomu/schema/effect'
import { AnalysisError } from '../../analysis/error/AnalysisError.js'
import type {
  PackageDependency,
  PackageExportEntry,
  PackageExportTarget,
  PackageJsonAnalysis,
} from '@gyomu/schema/typescript'
import type { FileSystem } from 'effect'
import type { FullPath } from '@gyomu/schema'

/**
 * Analyzes the package.json file located at the specified project root and returns a structured analysis result.
 *
 * @param projectRootAbsolutePath The absolute file path to the project root directory.
 *
 * @returns An Effect that yields a PackageJsonAnalysis object on success, or an AnalysisError if the file cannot be read or parsed. This operation requires a FileSystem service.
 */
export const analyzePackageJson = (
  projectRootAbsolutePath: FullPath,
): Effect.Effect<PackageJsonAnalysis, AnalysisError, FileSystem.FileSystem> => {
  const packageJson = join(projectRootAbsolutePath, 'package.json')
  return Effect.gen(function* () {
    const projectContent = yield* readStringFromFile(packageJson).pipe(
      Effect.mapError((e) =>
        wrapInfraError(AnalysisError, e, () => ({
          filePath: packageJson,
          message: 'fail to read package.json',
          phase: 'analysis' as const,
        })),
      ),
    )
    const result = yield* fromSync(AnalysisError, () => ({
      filePath: packageJson,
      message: 'fail to parse package.json',
      phase: 'analysis' as const,
    }))(() => {
      const parsedProject = JSON.parse(projectContent)
      return {
        name: parsedProject.name,
        version: parsedProject.version,
        moduleType: parsedProject.type == 'module' ? 'module' : 'commonjs',
        main: parsedProject.main,
        types: parsedProject.types,
        private: parsedProject.private ?? false,
        description: parsedProject.description,
        imports: [],
        exports: analyzeExportEntries(parsedProject.exports as PackageJsonExports | undefined),
        dependencies: analyzeDependencies(parsedProject.dependencies),
        devDependencies: analyzeDependencies(parsedProject.devDependencies),
        peerDependencies: analyzeDependencies(parsedProject.peerDependencies),
        optionalDependencies: analyzeDependencies(parsedProject.optionalDependencies),
        license: parsedProject.license,
      } satisfies PackageJsonAnalysis
    })
    return result
  })
}
type PackageJsonExports = string | Record<string, string | Record<string, string>>
const analyzeExportEntries = (
  exports: PackageJsonExports | undefined,
): Array<PackageExportEntry> => {
  if (!exports) return []

  if (typeof exports === 'string') {
    return [analyzeExportEntry('.', exports)]
  }

  return Object.entries(exports).map(([exportPath, target]) =>
    analyzeExportEntry(exportPath, target),
  )
}
const analyzeExportEntry = (
  exportPath: string,
  target: string | Record<string, string>,
): PackageExportEntry => {
  if (typeof target == 'string') {
    return {
      exportPath,
      targets: [{ condition: undefined, target }],
      wildcard: exportPath.includes('*'),
    }
  }

  const conditions = Object.keys(target)

  return {
    exportPath,
    targets: conditions.map(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (condition) => ({ condition, target: target[condition]! }) satisfies PackageExportTarget,
    ),
    wildcard: exportPath.includes('*'),
  }
}

const analyzeDependencies = (
  dependencies: Record<string, string> | undefined,
): Array<PackageDependency> => {
  if (!dependencies) return []
  return Object.entries(dependencies).map(([packageName, specifier]) =>
    analyzeDependencyEntry(packageName, specifier),
  )
}

const analyzeDependencyEntry = (packageName: string, specifier: string): PackageDependency => {
  const parts = specifier.split(':')
  if (parts.length == 1)
    return {
      kind: 'version',
      packageName,
      specifier,
    }
  return {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    kind: getSupportedDependencyKind(parts[0]!),
    packageName,
    specifier,
  }
}
