import path from 'node:path'

import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { toAbsolutePath } from '../path/toAbsolutePath.js'
import type { FullPath } from '@gyomu/schema'

/**
 * Creates a module specifier from a project-relative source path.
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
