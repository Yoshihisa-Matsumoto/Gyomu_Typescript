import { resolve } from 'node:path'
import { FullPath } from '@gyomu/schema'
import type { ProjectRelativePath, WorkspaceRelativePath } from '@gyomu/schema/typescript'

/**
 * Converts a project-relative or workspace-relative path into an absolute path.
 *
 * @param relativePath The relative path to convert.
 *
 * @param projectRoot The root path of the project.
 *
 * @returns The absolute path.
 */
export const toAbsolutePath = (
  relativePath: ProjectRelativePath | WorkspaceRelativePath,
  projectRoot: FullPath,
): FullPath => {
  return FullPath(resolve(projectRoot, relativePath))
}
