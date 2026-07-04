import { resolve } from 'node:path'
import { FullPath } from '@gyomu/schema/typescript'
import type { ProjectRelativePath, WorkspaceRelativePath } from '@gyomu/schema/typescript'

/**
 * Converts an project-relative file path into a absolute path.
 */
export const toAbsolutePath = (
  relativePath: ProjectRelativePath | WorkspaceRelativePath,
  projectRoot: FullPath,
): FullPath => {
  return FullPath(resolve(projectRoot, relativePath))
}
