import path from 'node:path'

import { toProjectRelativePath } from '../path/toProjectRelativePath.js'
import { normalizeModuleSpecifier } from './normalizeModuleSpecifier.js'

/**
 * Resolves a module specifier into a project-relative source path.
 */
export const moduleSpecifierToSourcePath = (
  moduleSpecifier: string,
  sourceFilePath: string,
  projectRoot: string,
): string => {
  const normalized = normalizeModuleSpecifier(moduleSpecifier)

  const absolutePath = path.resolve(path.dirname(sourceFilePath), normalized)

  return toProjectRelativePath(absolutePath, projectRoot)
}
