import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ProjectContext } from './project/ProjectContext.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Calculates the target file path for storing or retrieving analysis data for a given project source file.
 *
 * @param context The project context containing root directory information.
 *
 * @param sourceFilePath Path accepted by {@link Project.getSourceFile}.
 *
 * @returns The absolute path to the generated JSON analysis file.
 */
export const getFileAnalysisPath = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
): FullPath => FullPath(join(context.projectRoot, '.gyomu', 'cache', sourceFilePath + '.json'))
