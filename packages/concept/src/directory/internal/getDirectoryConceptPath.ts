import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { ProjectContext } from '@gyomu/ts-analysis'

/**
 * Calculates the file system path for a directory's concept metadata file.
 *
 * @param context The current project context containing root information.
 *
 * @param targetDirectory The directory path relative to the project root.
 *
 * @param option Optional configuration for metadata naming or locations.
 *
 * @returns The absolute path to the concept definition file.
 */
export const getDirectoryConceptPath = (
  context: ProjectContext,
  targetDirectory: ProjectRelativePath,
  option?: ConceptOptions,
): FullPath => {
  return FullPath(
    join(
      context.projectRoot,
      option?.metadataRoot ??
        join('.gyomu', option?.action?.WriteToTempFolder ? 'cache' : 'concept'),
      targetDirectory,
      '$Directory' + '.json',
    ),
  )
}
