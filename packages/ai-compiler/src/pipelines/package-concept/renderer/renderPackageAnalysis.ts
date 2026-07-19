import { buildPackageConceptInput } from './buildPackageConceptInput.js'
import type { PackageAnalysis } from '@gyomu/schema/concept'

export const renderPackageAnalysis = (context: PackageAnalysis): string => {
  // const output = {
  //   packageInfo: context.package,
  //   publicApi: context.exports,
  //   directoryConcepts: context.directories,
  //   dependencySummary: context.dependencies,
  //   fileSummary: context.exportedFiles,
  // }
  return JSON.stringify(buildPackageConceptInput(context), null, 2)
}
