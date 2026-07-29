import path from 'node:path'

import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { toAbsolutePath } from '../path/toAbsolutePath.js'
import type { FullPath } from '@gyomu/schema'

/**
 * Creates a module specifier from a project-relative source path.
 *
 * @param sourcePath The project-relative path to the target module.
 *
 * @param sourceFilePath The absolute path of the file importing the target module.
 *
 * @param projectRoot The absolute path of the project root directory.
 *
 * @returns A ProjectRelativePath representing the module specifier for the target.
 */
export const sourcePathToModuleSpecifier = (
  sourcePath: ProjectRelativePath,
  sourceFilePath: string,
  projectRoot: FullPath,
): ProjectRelativePath => {
  const targetAbsolutePath = toAbsolutePath(sourcePath, projectRoot)

  const relativePath = path.relative(path.dirname(sourceFilePath), targetAbsolutePath)

  const normalized = relativePath.replaceAll('\\', '/')

  const prefixed = normalized.startsWith('.') ? normalized : `./${normalized}`

  return ProjectRelativePath(prefixed.replace(/\.tsx?$/, '.js'))
}
