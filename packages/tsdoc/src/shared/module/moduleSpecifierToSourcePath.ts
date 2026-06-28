import path from 'node:path'

import { normalizeModuleSpecifier } from './normalizeModuleSpecifier.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Resolves a module specifier into a project-relative source path.
 */
export const moduleSpecifierToSourcePath = (
  moduleSpecifier: string,
  sourceFilePath: ProjectRelativePath,
): string => {
  const normalize = (p: string) => p.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '')
  const normalized = normalizeModuleSpecifier(moduleSpecifier)

  return normalize(path.join(path.dirname(sourceFilePath), normalized))
}
