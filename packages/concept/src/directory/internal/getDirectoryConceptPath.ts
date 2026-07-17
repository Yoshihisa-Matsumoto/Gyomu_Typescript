import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { ProjectContext } from '@gyomu/ts-analysis'

export const getDirectoryConceptPath = (
  context: ProjectContext,
  targetDirectory: ProjectRelativePath,
  option?: ConceptOptions,
): FullPath => {
  return FullPath(
    join(
      context.projectRoot,
      option?.metadataRoot ?? '.gyomu',
      targetDirectory,
      '$Directory' + '.json',
    ),
  )
}
