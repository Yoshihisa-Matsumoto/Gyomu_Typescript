import { rankDirectoriesByImportance } from '../../../domain/rankDirectoriesByImportance.js'
import type { PackageAnalysis } from '@gyomu/schema/concept'
import type { PackageConceptInput } from '../context/PackageConceptInput.js'

/**
 * Transforms a complete package analysis into a structured input format suitable for package conceptualization, including dependencies, public API details, and top directory concepts.
 *
 * @param packageAnalysis The detailed analysis object containing the package metadata, dependencies, exported symbols, and directory structure.
 *
 * @returns A structured PackageConceptInput object containing the derived package, filtered dependencies, public API definitions, and top directory concepts.
 */
export const buildPackageConceptInput = (packageAnalysis: PackageAnalysis): PackageConceptInput => {
  return {
    package: packageAnalysis.package,
    dependencies: packageAnalysis.dependencies
      .filter((dep) => dep.source == 'dependency')
      .map((dep) => ({
        packageName: dep.packageName,
        version: dep.resolvedVersion ?? dep.requestedVersion,
      })),
    publicApi: packageAnalysis.exports.map((exp) => ({
      exportPath: exp.exportPath,
      symbols: exp.exportedSymbols.map((sym) => ({ name: sym.name, summary: sym.summary.summary })),
    })),
    topDirectories: rankDirectoriesByImportance(packageAnalysis.directories)
      .slice(0, 5)
      .map((directory) => ({
        importance: directory.concept.importance,
        path: directory.path,
        responsibilities: directory.concept.relationships,
        summary: directory.concept.summary,
      })),
  }
}
