import { dirname, join } from 'node:path'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { normalizePath } from './normalizePath.js'

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
