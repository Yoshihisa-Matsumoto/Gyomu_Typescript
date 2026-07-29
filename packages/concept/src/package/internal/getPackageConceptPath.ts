import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { ProjectContext } from '@gyomu/ts-analysis'

/**
 * Calculates the path to a package's concept file, based on the project context and provided options.
 *
 * @param context The project context providing the root directory path.
 *
 * @param option Optional configuration for metadata root and action flags.
 *
 * @returns The resolved path to the package concept file as a FullPath object.
 */
export const getPackageConceptPath = (
  context: ProjectContext,
  option?: ConceptOptions,
): FullPath => {
  return FullPath(
    join(
      context.projectRoot,
      option?.metadataRoot ??
        join('.gyomu', option?.action?.WriteToTempFolder ? 'cache' : 'concept'),
      '$Package' + '.json',
    ),
  )
}
