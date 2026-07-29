import { dirname, join } from 'node:path'
import { pathExists } from '@gyomu/infra/fs'
import { Effect } from 'effect'
import { FullPath } from '@gyomu/schema'
import type { IOError } from '@gyomu/schema'
import type { FileSystem } from 'effect'

let calculatedWorkspaceRoot: string | undefined = undefined

/**
 * Resets the cached workspace root to undefined.
 */
export const ___resetWorkspaceRoot = () => {
  calculatedWorkspaceRoot = undefined
}

/**
 * Options for configuring the workspace root discovery process.
 */
export interface FindWorkspaceRootOptions {
  /**
   * The starting directory from which to begin searching for the workspace root.
   */
  readonly currentDirectory?: string
}

/**
 * Calculates and returns the workspace root path by searching for marker files or environment variables.
 *
 * @param startDirectory The directory from which the search starts. Defaults to current working directory.
 *
 * @returns An Effect that yields a FullPath upon success, or an IOError if file system operations fail.
 */
export const findWorkspaceRoot = (
  startDirectory: FullPath = FullPath(process.cwd()),
): Effect.Effect<FullPath, IOError, FileSystem.FileSystem> => {
  if (calculatedWorkspaceRoot) return Effect.succeed(FullPath(calculatedWorkspaceRoot))

  const envRoot = process.env.GYOMU_ROOT
  if (envRoot && envRoot.trim().length > 3) {
    calculatedWorkspaceRoot = envRoot
    return Effect.succeed(FullPath(envRoot))
  }

  const currentPos = startDirectory

  return Effect.gen(function* () {
    const rootPathFromPnpmWorkspace = yield* findFile(currentPos, 'pnpm-workspace.yaml')
    if (rootPathFromPnpmWorkspace && rootPathFromPnpmWorkspace.length > 3) {
      calculatedWorkspaceRoot = rootPathFromPnpmWorkspace
      return FullPath(calculatedWorkspaceRoot)
    }

    const rootPathFromGit = yield* findFile(currentPos, '.git')
    if (rootPathFromGit && rootPathFromGit.length > 3) {
      calculatedWorkspaceRoot = rootPathFromGit
      return FullPath(calculatedWorkspaceRoot)
    }

    return FullPath(currentPos)
  })
}

const findFile = (
  currentPath: FullPath,
  fileName: string,
): Effect.Effect<string | undefined, IOError, FileSystem.FileSystem> => {
  const targetFilePath = FullPath(join(currentPath, fileName))
  return Effect.gen(function* () {
    const exists = yield* pathExists(targetFilePath)
    if (exists) return currentPath
    else {
      const parent = FullPath(dirname(currentPath))

      if (parent === currentPath) return undefined
      return yield* findFile(parent, fileName)
    }
  })
}
