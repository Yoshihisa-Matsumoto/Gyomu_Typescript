import { resolve } from 'node:path'

/**
 * Converts an project-relative file path into a absolute path.
 */
export const toProjectAbsolutePath = (relativePath: string, projectRoot: string): string => {
  return resolve(projectRoot, relativePath)
}
