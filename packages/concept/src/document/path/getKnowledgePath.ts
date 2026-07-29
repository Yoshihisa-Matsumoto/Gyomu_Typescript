import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { ProjectContext } from '@gyomu/ts-analysis'

/**
 * Calculates the base file system path for knowledge artifacts within the project based on provided context and configuration options.
 *
 * @param context The project execution context containing the root directory.
 *
 * @param option Optional configuration for custom metadata paths or behavior overrides.
 *
 * @returns The resolved absolute file system path for project knowledge.
 */
export const getKnowledgePath = (context: ProjectContext, option?: ConceptOptions): FullPath => {
  return FullPath(
    join(
      context.projectRoot,
      option?.metadataRoot ??
        join('.gyomu', option?.action?.WriteToTempFolder ? 'cache' : 'knowledge'),
    ),
  )
}
