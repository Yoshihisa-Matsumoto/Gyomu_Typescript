import path from 'node:path'

import { toProjectAbsolutePath } from '../path/toProjectAbsolutePath.js'

/**
 * Creates a module specifier from a project-relative source path.
 */
export const sourcePathToModuleSpecifier = (
  sourcePath: string,
  sourceFilePath: string,
  projectRoot: string,
): string => {
  const targetAbsolutePath = toProjectAbsolutePath(sourcePath, projectRoot)

  const relativePath = path.relative(path.dirname(sourceFilePath), targetAbsolutePath)

  const normalized = relativePath.replaceAll('\\', '/')

  const prefixed = normalized.startsWith('.') ? normalized : `./${normalized}`

  return prefixed.replace(/\.tsx?$/, '.js')
}
