import path from 'node:path'

/**
 * Converts an absolute file path into a project-relative path.
 *
 * @remarks
 * The returned path always uses forward slashes (`/`) regardless of the
 * operating system to ensure stable identifiers and snapshots.
 *
 * Example:
 *
 * ```text
 * filePath:
 *   /workspace/project/src/user/UserService.ts
 *
 * projectRoot:
 *   /workspace/project
 *
 * result:
 *   src/user/UserService.ts
 * ```
 *
 * This path format is intended to be used as the canonical project-internal
 * path representation.
 */
export const toProjectRelativePath = (filePath: string, projectRoot: string): string => {
  return path.relative(projectRoot, filePath).replaceAll('\\', '/')
}
