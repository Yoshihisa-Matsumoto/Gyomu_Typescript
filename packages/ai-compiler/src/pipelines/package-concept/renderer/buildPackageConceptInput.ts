import { selectTopDirectories } from './selectTopDirectories.js'
import type { PackageAnalysis } from '@gyomu/schema/concept'
import type { PackageConceptInput } from '../context/PackageConceptInput.js'

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
    topDirectories: selectTopDirectories(packageAnalysis.directories).map((directory) => ({
      importance: directory.concept.importance,
      path: directory.path,
      responsibilities: directory.concept.relationships,
      summary: directory.concept.summary,
    })),
  }
}
