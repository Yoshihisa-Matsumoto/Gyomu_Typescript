import { dirname, join } from 'node:path'
import { pathExists } from '@gyomu/infra/fs'
import { Effect } from 'effect'
import { FullPath } from '@gyomu/schema/typescript'
import type { IOError } from '@gyomu/schema'
import type { FileSystem } from 'effect'

let calculatedWorkspaceRoot: string | undefined = undefined

export const ___resetWorkspaceRoot = () => {
  calculatedWorkspaceRoot = undefined
}
export interface FindWorkspaceRootOptions {
  readonly currentDirectory?: string
}
export const findWorkspaceRoot = (
  startDirectory = process.cwd(),
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
  currentPath: string,
  fileName: string,
): Effect.Effect<string | undefined, IOError, FileSystem.FileSystem> => {
  const targetFilePath = join(currentPath, fileName)
  return Effect.gen(function* () {
    const exists = yield* pathExists(targetFilePath)
    if (exists) return currentPath
    else {
      const parent = dirname(currentPath)

      if (parent === currentPath) return undefined
      return yield* findFile(parent, fileName)
    }
  })
}
