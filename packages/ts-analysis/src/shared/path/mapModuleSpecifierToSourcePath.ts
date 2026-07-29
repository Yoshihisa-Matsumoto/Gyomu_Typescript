import { dirname, join } from 'node:path'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { normalizePath } from './normalizePath.js'

/**
 * Maps a relative module specifier to its corresponding absolute or relative source path based on the provided source path.
 *
 * @param moduleSpecifier The module specifier to map.
 *
 * @param sourcePath The base path of the source file.
 *
 * @returns The resolved project relative path, or undefined if the specifier cannot be mapped.
 */
export const mapModuleSpecifierToSourcePath = (
  moduleSpecifier: string,
  sourcePath: ProjectRelativePath,
): ProjectRelativePath | undefined => {
  // console.log(moduleSpecifier)
  if (!moduleSpecifier.startsWith('.')) return undefined
  // console.log(dirname(sourcePath))
  const moduleResolutionPath = join(dirname(sourcePath), moduleSpecifier)

  // console.log(moduleResolutionPath)
  if (moduleResolutionPath.startsWith('..')) return undefined
  return ProjectRelativePath(normalizePath(moduleResolutionPath.replace(/\.(c|m)?js$/, '.ts')))
}
