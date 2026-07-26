import { buildPackageConceptInput } from './buildPackageConceptInput.js'
import type { PackageAnalysis } from '@gyomu/schema/concept'

/**
 * Renders a `PackageAnalysis` object into a formatted JSON string representing the package concept input.
 *
 * @param context The package analysis data to be rendered.
 *
 * @returns A JSON string representation of the package concept input.
 */
export const renderPackageAnalysis = (context: PackageAnalysis): string => {
  // const output = {
  //   packageInfo: context.package,
  //   publicApi: context.exports,
  //   directoryConcepts: context.directories,
  //   dependencySummary: context.dependencies,
  //   fileSummary: context.exportedFiles,
  // }
  const input = buildPackageConceptInput(context)
  // console.dir(input, { depth: null })
  return JSON.stringify(input, null, 2)
}
