import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { ProjectContext } from '@gyomu/ts-analysis'

export const getPackageConceptPath = (
  context: ProjectContext,
  option?: ConceptOptions,
): FullPath => {
  return FullPath(
    join(
      context.projectRoot,
      option?.metadataRoot ?? join('.gyomu', 'concept'),
      '$Package' + '.json',
    ),
  )
}
