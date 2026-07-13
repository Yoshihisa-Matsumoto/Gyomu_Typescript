import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { ProjectContext } from '@gyomu/ts-analysis'

export const getDirectoryConceptPath = (
  context: ProjectContext,
  targetDirectory: ProjectRelativePath,
): FullPath => {
  return FullPath(join(context.projectRoot, '.gyomu', targetDirectory, '$Directory' + '.json'))
}
