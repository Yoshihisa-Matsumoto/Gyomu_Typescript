import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ProjectContext } from './project/ProjectContext.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export const getFileAnalysisPath = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
): FullPath => FullPath(join(context.projectRoot, '.gyomu', 'cache', sourceFilePath + '.json'))
